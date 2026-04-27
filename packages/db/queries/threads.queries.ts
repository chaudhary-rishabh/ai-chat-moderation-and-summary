import { db, threads } from "../src";
import { eq, sql } from "drizzle-orm";

export const upsertThread = (rootMessageId: string, roomId: string) =>
  db
    .insert(threads)
    .values({ rootMessageId, roomId, replyCount: 0, lastReplyAt: new Date() })
    .onConflictDoUpdate({
      target: [threads.rootMessageId],
      set: { lastReplyAt: new Date(), updatedAt: new Date() },
    })
    .returning();

export const incrementReplyCount = (rootMessageId: string) =>
  db
    .update(threads)
    .set({ replyCount: sql`${threads.replyCount} + 1`, lastReplyAt: new Date(), updatedAt: new Date() })
    .where(eq(threads.rootMessageId, rootMessageId))
    .returning();

export const getThread = (rootMessageId: string) =>
  db.query.threads.findFirst({ where: eq(threads.rootMessageId, rootMessageId) });
