import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { expireStories } from "db/queries";
import { logger } from "../lib/logger";

const STORY_EXPIRY_QUEUE = "story-expiry";

export const initStoryExpiryWorker = (): void => {
  const queue = new Queue(STORY_EXPIRY_QUEUE, { connection: redis });

  // Add repeatable job: run every 60 minutes
  void queue.add("expire-stories", {}, {
    repeat: { pattern: "0 * * * *" },
    removeOnComplete: true,
  });

  const worker = new Worker(
    STORY_EXPIRY_QUEUE,
    async (job) => {
      const result = await expireStories();
      logger.info({ expiredCount: result.length }, "stories_expired");
    },
    {
      connection: redis,
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 20 },
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id }, "story_expiry_job_failed");
  });

  logger.info("story_expiry_worker_initialized");
};
