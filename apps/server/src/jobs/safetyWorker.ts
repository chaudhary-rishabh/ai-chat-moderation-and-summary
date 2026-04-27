import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { db, safetyFlags, messages } from "db/src";
import { eq } from "drizzle-orm";
import { classifyMessage } from "../ai/safety";
import { roomManager } from "../ws/roomManager";
import { logger } from "../lib/logger";
import { setQueue } from "./queue";

const SAFETY_QUEUE = "safety";

export const initSafetyWorker = (): void => {
  const queue = new Queue(SAFETY_QUEUE, { connection: redis });
  setQueue(SAFETY_QUEUE, queue);

  const worker = new Worker(
    SAFETY_QUEUE,
    async (job) => {
      const { messageId, content, roomId, senderId } = job.data as {
        messageId: string;
        content: string;
        roomId: string;
        senderId: string;
      };

      if (!content || content.trim().length === 0) return;

      const result = await classifyMessage(content);

      if (result.flagType === "safe" || result.confidenceScore <= 0.7) return;

      // Insert safety flag
      await db.insert(safetyFlags).values({
        messageId,
        flagType: result.flagType as any,
        confidenceScore: result.confidenceScore,
        reasoning: result.reasoning ?? null,
        offendingSpan: result.offendingSpan ?? null,
        status: "pending",
      });

      // Mark message as flagged
      await db.update(messages).set({ isFlagged: true }).where(eq(messages.id, messageId));

      // Alert admins
      roomManager.sendToAdmins({
        type: "safety:alert",
        payload: {
          messageId,
          roomId,
          senderId,
          flagType: result.flagType,
          confidenceScore: result.confidenceScore,
          offendingSpan: result.offendingSpan,
        },
      });

      logger.info(
        { messageId, flagType: result.flagType, confidenceScore: result.confidenceScore },
        "safety_flag_created",
      );
    },
    {
      connection: redis,
      concurrency: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, messageId: job?.data?.messageId }, "safety_job_failed");
  });

  logger.info("safety_worker_initialized");
};
