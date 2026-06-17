import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const pdfQueue = new Queue("pdf-conversion", {
  connection: {
    url: redisUrl,
  },
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5s, then 10s, then 20s
    },
    removeOnComplete: true, // Delete job metadata from Redis on completion
    removeOnFail: false,   // Keep failed metadata for debugging
  },
});

export interface JobData {
  pdfPath: string;
  fileName: string;
  originalName: string;
  publishDate?: string; // for normal editions
  title?: string;       // for special editions
  slug?: string;        // for special editions
  isSpecial: boolean;
}

export async function addPdfJob(jobId: string, data: JobData) {
  return pdfQueue.add("convert-pdf-job", data, { jobId });
}
