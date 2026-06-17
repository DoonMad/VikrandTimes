import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const queue = new Queue("pdf-conversion", {
  connection: {
    url: redisUrl,
  },
});

async function inspect() {
  console.log("🔍 Connecting to Redis and inspecting queue...");
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    console.log("----------------------------");
    console.log(`Waiting:   ${waiting}`);
    console.log(`Active:    ${active}`);
    console.log(`Completed: ${completed}`);
    console.log(`Failed:    ${failed}`);
    console.log(`Delayed:   ${delayed}`);
    console.log("----------------------------");

    const failedJobs = await queue.getFailed();
    if (failedJobs.length > 0) {
      console.log("\n❌ Failed Jobs Sample:");
      failedJobs.slice(0, 5).forEach((j) => {
        console.log(`- Job ${j.id}: ${j.failedReason}`);
      });
    }

    const activeJobs = await queue.getActive();
    if (activeJobs.length > 0) {
      console.log("\n👷 Active Jobs Sample:");
      activeJobs.slice(0, 5).forEach((j) => {
        console.log(`- Job ${j.id} is active`);
      });
    }

    const waitingJobs = await queue.getWaiting();
    if (waitingJobs.length > 0) {
      console.log("\n⏳ Waiting Jobs Sample:");
      waitingJobs.slice(0, 5).forEach((j) => {
        console.log(`- Job ${j.id} is waiting`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error inspecting queue:", error);
    process.exit(1);
  }
}

inspect();
