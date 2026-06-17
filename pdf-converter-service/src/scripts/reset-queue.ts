import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const queue = new Queue("pdf-conversion", {
  connection: {
    url: redisUrl,
  },
});

async function resetQueue() {
  console.log("🧹 Clearing all failed and waiting jobs from the pdf-conversion queue...");
  try {
    // Completely reset the queue
    await queue.obliterate({ force: true });
    console.log("✅ Queue successfully cleared and reset!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to clear queue:", error);
    process.exit(1);
  }
}

resetQueue();
