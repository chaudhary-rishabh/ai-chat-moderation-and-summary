import { db, aiChatSessions } from "../src";
import { eq, desc, sql } from "drizzle-orm";
import type { AiMessage } from "../schema";

export const getOrCreateSession = (userId: string) =>
  db.transaction(async (tx) => {
    const existing = await tx.query.aiChatSessions.findFirst({
      where: eq(aiChatSessions.userId, userId),
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    });

    if (existing) return existing;

    const [created] = await tx
      .insert(aiChatSessions)
      .values({ userId, messages: [], tokenCount: 0 })
      .returning();

    return created!;
  });

export const appendMessage = (sessionId: string, message: AiMessage) =>
  db
    .update(aiChatSessions)
    .set({
      messages: sql`${aiChatSessions.messages} || ${JSON.stringify([message])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(aiChatSessions.id, sessionId))
    .returning();

export const getSessionMessages = (sessionId: string) =>
  db.query.aiChatSessions.findFirst({
    where: eq(aiChatSessions.id, sessionId),
    columns: { messages: true },
  });

export const updateTokenCount = (sessionId: string, count: number) =>
  db
    .update(aiChatSessions)
    .set({ tokenCount: sql`${aiChatSessions.tokenCount} + ${count}`, updatedAt: new Date() })
    .where(eq(aiChatSessions.id, sessionId));
