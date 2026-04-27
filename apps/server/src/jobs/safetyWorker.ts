import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { db, safetyFlags, messages } from "db/src";
import { eq } from "drizzle-orm";
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

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          model: "deepseek-reasoner",
          messages: [
            {
              role: "system",
              content: `You are a content safety classifier. Analyze the message and classify it.
Return ONLY a JSON object with this exact format:
{
  "flagType": "abuse" | "bullying" | "harassment" | "hate_speech" | "spam" | "self_harm" | "other" | "safe",
  "confidenceScore": <number 0.0-1.0>,
  "reasoning": "<one sentence explanation>",
  "offendingSpan": "<exact text that triggered the flag, or null if safe>"
}`,
            },
            { role: "user", content },
          ],
          temperature: 0,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        logger.error({ status: response.status, messageId }, "safety_api_error");
        return;
      }

      const json = (await response.json()) as { choices: { message: { content: string } }[] };
      const rawContent = json.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(rawContent) as {
        flagType: string;
        confidenceScore: number;
        reasoning: string;
        offendingSpan: string | null;
      };

      if (parsed.flagType === "safe" || parsed.confidenceScore <= 0.7) return;

      // Insert safety flag
      await db.insert(safetyFlags).values({
        messageId,
        flagType: parsed.flagType as any,
        confidenceScore: parsed.confidenceScore,
        reasoning: parsed.reasoning ?? null,
        offendingSpan: parsed.offendingSpan ?? null,
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
          flagType: parsed.flagType,
          confidenceScore: parsed.confidenceScore,
          offendingSpan: parsed.offendingSpan,
        },
      });

      logger.info({ messageId, flagType: parsed.flagType, confidenceScore: parsed.confidenceScore }, "safety_flag_created");
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
