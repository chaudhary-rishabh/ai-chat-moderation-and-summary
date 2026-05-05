import { Queue, Worker } from "bullmq";
import { redis, bullmqRedis } from "../lib/redis";
import { generateEmbedding } from "../ai/rag/embed";
import { insertEmbedding } from "db/queries";
import { logger } from "../lib/logger";
import { setQueue } from "./queue";

const EMBED_QUEUE = "embed";

export const initEmbedWorker = (): void => {
  const queue = new Queue(EMBED_QUEUE, { connection: bullmqRedis });
  setQueue(EMBED_QUEUE, queue);

  const worker = new Worker(
    EMBED_QUEUE,
    async (job) => {
      const { messageId, content } = job.data as { messageId: string; content: string };

      if (!content || content.trim().length === 0) return;

      try {
        const embedding = await generateEmbedding(content);

        await insertEmbedding(messageId, embedding, "deepseek-v3");

        logger.info({ messageId }, "embed_generated");
      } catch (err) {
        logger.error({ err, messageId }, "embed_job_failed");
        throw err;
      }
    },
    {
      connection: bullmqRedis,
      concurrency: 2,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, messageId: job?.data?.messageId }, "embed_job_failed");
  });

  logger.info("embed_worker_initialized");
};
