import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/init";
import { addPdfJob } from "./queue";
import "./worker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// In-Memory store for active job progress tracking
export const activeJobs = new Map<
  string,
  {
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    total: number;
    error?: string;
  }
>();

// Setup uploads folder
const uploadDir = path.join(__dirname, "../temp-uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB upload limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Auto-run DB init on startup
initializeDatabase()
  .then(() => {
    console.log("⚡ Database is initialized and ready.");
  })
  .catch((err) => {
    console.error("❌ Critical database initialization error:", err);
  });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// GET job status endpoint (Polled by Next.js frontend)
app.get("/api/jobs/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({ jobId, ...job });
});

// POST endpoint to upload a PDF for conversion
app.post("/api/editions/upload", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file;
    const { date, title, slug, isSpecial } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const isSpecialBool = isSpecial === "true" || isSpecial === true;

    if (isSpecialBool && (!title || !slug)) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Title and slug are required for special editions" });
    }

    if (!isSpecialBool && !date) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Date is required for normal editions" });
    }

    // 1. Generate unique jobId
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 2. Insert into activeJobs tracking
    activeJobs.set(jobId, {
      status: "queued",
      progress: 0,
      total: 0,
    });

    // 3. Queue the BullMQ job
    await addPdfJob(jobId, {
      pdfPath: file.path,
      fileName: file.filename,
      originalName: file.originalname,
      publishDate: date,
      title,
      slug,
      isSpecial: isSpecialBool,
    });

    console.log(`📥 Enqueued job ${jobId} for file ${file.originalname}`);

    // 4. Return jobId immediately
    res.status(202).json({
      message: "File uploaded and queued for processing.",
      jobId,
    });
  } catch (err: any) {
    console.error("❌ Upload endpoint error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Trigger legacy migration
app.post("/api/admin/migrate-existing", async (req, res) => {
  // We will code the migration trigger logic later in Commit 4
  res.status(501).json({ error: "Migration route not implemented yet" });
});

app.listen(PORT, () => {
  console.log(`🚀 Dedicated conversion service running on http://localhost:${PORT}`);
});
