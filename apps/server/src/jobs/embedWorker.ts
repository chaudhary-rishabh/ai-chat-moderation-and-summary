import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { db, embeddings } from "db/src";
import { getMessageById } from "db/queries";
import { logger } from "../lib/logger";
import { setQueue } from "./queue";

const EMBED_QUEUE = "embed";

export const initEmbedWorker = (): void => {
  const queue = new Queue(EMBED_QUEUE, { connection: redis });
  setQueue(EMBED_QUEUE, queue);

  const worker = new Worker(
    EMBED_QUEUE,
    async (job) => {
      const { messageId, content } = job.data as { messageId: string; content: string };

      if (!content || content.trim().length === 0) return;

      const message = await getMessageById(messageId);
      if (!message) {
        logger.warn({ messageId }, "embed_message_not_found");
        return;
      }

      // Call DeepSeek embedding endpoint (OpenAI-compatible)
      const response = await fetch("https://api.deepseek.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          input: content,
        }),
      });

      if (!response.ok) {
        logger.error({ status: response.status, messageId }, "embed_api_error");
        return;
      }

      const json = (await response.json()) as { data: { embedding: number[] }[] };
      const embedding = json.data?.[0]?.embedding;
      if (!embedding) {
        logger.error({ messageId }, "embed_empty_response");
        return;
      }

      await db.insert(embeddings).values({
        messageId,
        embedding: embedding as any,
        modelVersion: "deepseek-v3",
      });

      logger.info({ messageId }, "embed_generated");
    },
    {
      connection: redis,
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
