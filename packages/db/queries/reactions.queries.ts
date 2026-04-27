import { db, reactions } from "../src";
import { and, eq } from "drizzle-orm";

export const upsertReaction = (messageId: string, userId: string, emoji: string) =>
  db
    .insert(reactions)
    .values({ messageId, userId, emoji })
    .onConflictDoUpdate({
      target: [reactions.messageId, reactions.userId, reactions.emoji],
      set: { createdAt: new Date() },
    })
    .returning();

export const deleteReaction = (messageId: string, userId: string, emoji: string) =>
  db
    .delete(reactions)
    .where(and(eq(reactions.messageId, messageId), eq(reactions.userId, userId), eq(reactions.emoji, emoji)))
    .returning();

export const getReactionsByMessage = (messageId: string) =>
  db.query.reactions.findMany({
    where: eq(reactions.messageId, messageId),
    with: { user: { columns: { id: true, name: true } } },
  });
