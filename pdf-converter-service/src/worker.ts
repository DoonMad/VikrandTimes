import { Worker } from "bullmq";
import { fromPath } from "pdf2pic";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { activeJobs } from "./index";
import { JobData } from "./queue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Worker to process PDF conversions
const worker = new Worker<JobData>(
  "pdf-conversion",
  async (job) => {
    const jobId = job.id!;
    const { pdfPath: rawPdfPath, publishDate, title, slug, isSpecial, isMigration, thumbnailPath } = job.data;

    console.log(`👷 Worker started job ${jobId} (isSpecial: ${isSpecial}, isMigration: ${isMigration})`);

    activeJobs.set(jobId, {
      status: "processing",
      progress: 0,
      total: 0,
    });

    const tempDir = path.join(__dirname, `../temp-${jobId}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const bucket = isSpecial ? "special-editions-pdf" : "editions-pdf";
    const originalPath = isSpecial ? `${slug}.pdf` : `editions/${publishDate}.pdf`;
    let pdfPath = rawPdfPath;

    // Download PDF from Supabase if this is a migration job
    if (isMigration) {
      console.log(`📥 Migration job: downloading legacy PDF from ${bucket}/${originalPath}...`);
      const { data: pdfData, error: downloadErr } = await supabase.storage
        .from(bucket)
        .download(originalPath);

      if (downloadErr) {
        throw new Error(`Failed to download legacy PDF: ${downloadErr.message}`);
      }

      pdfPath = path.join(tempDir, `legacy-${jobId}.pdf`);
      fs.writeFileSync(pdfPath, Buffer.from(await pdfData.arrayBuffer()));
    }

    const startTime = Date.now();
    let originalSize = 0;
    let compressedSize = 0;
    let totalPages = 0;

    try {
      // 1. Get original PDF file size
      const stats = fs.statSync(pdfPath);
      originalSize = stats.size;

      // 2. Determine total pages using pdfjs-dist
      const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
      const loadingTask = pdfjsLib.getDocument({
        data: dataBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      totalPages = pdf.numPages;

      console.log(`📄 PDF has ${totalPages} pages. Starting conversion...`);

      activeJobs.set(jobId, {
        status: "processing",
        progress: 0,
        total: totalPages,
      });

      // 3. Initialize pdf2pic converter
      const converter = fromPath(pdfPath, {
        density: 200, // Higher DPI for sharper text rendering
        saveFilename: `page-${jobId}`,
        savePath: tempDir,
        format: "png",
        width: 1800, // 2400px width ensures high-zoom readability
        height: undefined,
        preserveAspectRatio: true,
      });

      const bucket = isSpecial ? "special-editions-pdf" : "editions-pdf";

      // 4. Convert and upload page-by-page
      for (let i = 1; i <= totalPages; i++) {
        console.log(`⏳ Converting page ${i}/${totalPages}...`);

        const conversionResult = await converter(i);
        const pngPath = conversionResult.path;

        if (!pngPath || !fs.existsSync(pngPath)) {
          throw new Error(`Failed to convert page ${i} to PNG.`);
        }

        // Compress PNG to WebP buffer using sharp
        const webpBuffer = await sharp(pngPath)
          .webp({ quality: 85 }) // 85% WebP quality for cleaner text edges
          .toBuffer();

        compressedSize += webpBuffer.length;

        // Path in Supabase storage: webp/{publishDate}/page-X.webp or webp/{slug}/page-X.webp
        const uploadPath = isSpecial
          ? `webp/${slug}/page-${i}.webp`
          : `webp/${publishDate}/page-${i}.webp`;

        console.log(`☁️ Uploading page ${i} to ${bucket}/${uploadPath}...`);
        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(uploadPath, webpBuffer, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadErr) {
          throw uploadErr;
        }

        // Clean up temporary PNG
        fs.unlinkSync(pngPath);

        // Update in-memory job progress
        activeJobs.set(jobId, {
          status: "processing",
          progress: i,
          total: totalPages,
        });
      }

      // 5. Upload original PDF to Supabase storage to maintain backwards compatibility
      if (!isMigration) {
        console.log(`☁️ Uploading original PDF to ${bucket}/${originalPath}...`);
        
        const { error: pdfUploadErr } = await supabase.storage
          .from(bucket)
          .upload(originalPath, fs.readFileSync(pdfPath), {
            contentType: "application/pdf",
            upsert: true,
          });

        if (pdfUploadErr) {
          throw pdfUploadErr;
        }
      } else {
        console.log(`⏭️ Migration job: skipping original PDF upload (already exists in storage).`);
      }

      // 5.5 Handle Special Edition Cover Thumbnail (only if new publish, not migration)
      let thumbnailUrl = null;
      if (isSpecial && !isMigration) {
        let thumbnailBuffer: Buffer | null = null;
        let ext = "webp";

        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
          console.log(`🖼️ Custom thumbnail provided. Processing...`);
          thumbnailBuffer = await sharp(thumbnailPath)
            .resize({ width: 600 })
            .webp({ quality: 80 })
            .toBuffer();
        } else {
          console.log(`🖼️ No custom thumbnail. Generating from page 1...`);
          const page1PngPath = path.join(tempDir, `page-${jobId}_1.png`);
          if (fs.existsSync(page1PngPath)) {
            thumbnailBuffer = await sharp(page1PngPath)
              .resize({ width: 600 })
              .webp({ quality: 80 })
              .toBuffer();
          }
        }

        if (thumbnailBuffer) {
          const thumbPath = `${slug}.webp`;
          console.log(`☁️ Uploading thumbnail to special-editions-thumbnails/${thumbPath}...`);
          const { error: thumbUploadErr } = await supabase.storage
            .from("special-editions-thumbnails")
            .upload(thumbPath, thumbnailBuffer, {
              contentType: "image/webp",
              upsert: true,
            });

          if (thumbUploadErr) {
            console.error("⚠️ Failed to upload thumbnail:", thumbUploadErr.message);
          } else {
            const { data: thumbData } = supabase.storage
              .from("special-editions-thumbnails")
              .getPublicUrl(thumbPath);
            thumbnailUrl = thumbData.publicUrl;
          }
        }
      }

      // 6. Update database records
      console.log(`💾 Updating database record with page count (${totalPages})...`);
      if (isSpecial) {
        const updateData: any = { page_count: totalPages };
        if (thumbnailUrl) {
          updateData.thumbnail_url = thumbnailUrl;
        }

        const { error: dbErr } = await supabase
          .from("special_editions")
          .update(updateData)
          .eq("slug", slug);

        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase
          .from("editions")
          .upsert({
            publish_date: publishDate,
            page_count: totalPages,
          });

        if (dbErr) throw dbErr;
      }

      // 7. Record metrics
      const conversionTime = Date.now() - startTime;
      console.log(`📊 Saving conversion metrics: ${conversionTime}ms, ratio: ${((1 - (compressedSize / originalSize)) * 100).toFixed(1)}% savings`);
      
      const { error: metricsErr } = await supabase.from("metrics").insert({
        target_id: isSpecial ? slug! : publishDate!,
        original_size_bytes: originalSize,
        compressed_size_bytes: compressedSize,
        conversion_time_ms: conversionTime,
        page_count: totalPages,
      });

      if (metricsErr) {
        console.warn("⚠️ Warning: Failed to record metrics:", metricsErr.message);
      }

      // Mark job as completed
      activeJobs.set(jobId, {
        status: "completed",
        progress: totalPages,
        total: totalPages,
      });

      console.log(`🎉 Job ${jobId} successfully completed!`);
    } catch (err: any) {
      console.error(`❌ Job ${jobId} failed:`, err);
      activeJobs.set(jobId, {
        status: "failed",
        progress: 0,
        total: totalPages,
        error: err.message || "Unknown conversion error",
      });
      throw err;
    } finally {
      // Clean up temp uploads and processed temp directory
      try {
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        console.error("⚠️ Failed to clean up temp files:", cleanupErr);
      }

      // Auto-expire job from activeJobs in 5 minutes
      setTimeout(() => {
        activeJobs.delete(jobId);
        console.log(`🗑️ Cleared completed job ${jobId} from memory.`);
      }, 5 * 60 * 1000);
    }
  },
  {
    connection: {
      url: redisUrl,
    },
    concurrency: 1, // Process one PDF at a time to prevent CPU throttling
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} marked as completed in queue.`);
});

worker.on("failed", (job, err) => {
  console.error(`🚨 Job ${job?.id} failed with error:`, err);
});
