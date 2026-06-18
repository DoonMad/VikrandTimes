import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/init";
import { addPdfJob } from "./queue";
import "./worker";
import { createClient } from "@supabase/supabase-js";

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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://www.vikrandtimes.com",
  "https://vikrandtimes.com"
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  }
}));
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
app.post("/api/editions/upload", upload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const pdfFile = files?.pdf?.[0];
    const thumbnailFile = files?.thumbnail?.[0];
    const { date, title, slug, isSpecial } = req.body;

    if (!pdfFile) {
      if (thumbnailFile) fs.unlinkSync(thumbnailFile.path);
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const isSpecialBool = isSpecial === "true" || isSpecial === true;

    if (isSpecialBool && (!title || !slug)) {
      // Clean up uploaded files
      fs.unlinkSync(pdfFile.path);
      if (thumbnailFile) fs.unlinkSync(thumbnailFile.path);
      return res.status(400).json({ error: "Title and slug are required for special editions" });
    }

    if (!isSpecialBool && !date) {
      fs.unlinkSync(pdfFile.path);
      if (thumbnailFile) fs.unlinkSync(thumbnailFile.path);
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
      pdfPath: pdfFile.path,
      fileName: pdfFile.filename,
      originalName: pdfFile.originalname,
      publishDate: date,
      title,
      slug,
      isSpecial: isSpecialBool,
      thumbnailPath: thumbnailFile?.path,
    });

    console.log(`📥 Enqueued job ${jobId} for file ${pdfFile.originalname}`);

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
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("📥 Admin triggered legacy migration API.");

  try {
    const { data: normalEditions, error: normalErr } = await supabase
      .from("editions")
      .select("publish_date, page_count");

    if (normalErr) throw normalErr;

    const { data: specialEditions, error: specialErr } = await supabase
      .from("special_editions")
      .select("slug, title, publish_date, page_count");

    if (specialErr) throw specialErr;

    let enqueuedCount = 0;

    if (normalEditions && normalEditions.length > 0) {
      for (const edition of normalEditions) {
        const jobId = `migrate-edition-${edition.publish_date}`;
        // Verify if already in queue or map first
        if (!activeJobs.has(jobId)) {
          activeJobs.set(jobId, { status: "queued", progress: 0, total: 0 });
          await addPdfJob(jobId, {
            pdfPath: "",
            publishDate: edition.publish_date,
            isSpecial: false,
            isMigration: true,
          });
          enqueuedCount++;
        }
      }
    }

    if (specialEditions && specialEditions.length > 0) {
      for (const edition of specialEditions) {
        const jobId = `migrate-special-${edition.slug}`;
        if (!activeJobs.has(jobId)) {
          activeJobs.set(jobId, { status: "queued", progress: 0, total: 0 });
          await addPdfJob(jobId, {
            pdfPath: "",
            slug: edition.slug,
            title: edition.title,
            publishDate: edition.publish_date,
            isSpecial: true,
            isMigration: true,
          });
          enqueuedCount++;
        }
      }
    }

    res.json({
      message: `Successfully enqueued ${enqueuedCount} legacy editions for background conversion.`,
      enqueuedCount,
    });
  } catch (err: any) {
    console.error("❌ Admin migration trigger failed:", err);
    res.status(500).json({ error: err.message || "Migration failed to start" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Dedicated conversion service running on http://localhost:${PORT}`);
});
