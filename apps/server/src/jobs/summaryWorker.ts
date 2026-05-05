import { Queue, Worker } from "bullmq";
import { redis, bullmqRedis } from "../lib/redis";
import { summarizeRoom } from "../ai/summarize";
import { logger } from "../lib/logger";

const SUMMARY_QUEUE = "summary";

export const initSummaryWorker = (): void => {
  const queue = new Queue(SUMMARY_QUEUE, { connection: bullmqRedis });

  void queue.add("summarize-active-rooms", {}, {
    repeat: { pattern: "0 */6 * * *" },
    removeOnComplete: true,
  });

  const worker = new Worker(
    SUMMARY_QUEUE,
    async () => {
      // This worker is triggered on a schedule to summarize active rooms.
      // In production, room IDs would be fetched from Redis or DB.
      logger.info("summary_worker_tick");
    },
    {
      connection: bullmqRedis,
      removeOnComplete: { count: 20 },
      removeOnFail: { count: 10 },
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id }, "summary_job_failed");
  });

  logger.info("summary_worker_initialized");
};
