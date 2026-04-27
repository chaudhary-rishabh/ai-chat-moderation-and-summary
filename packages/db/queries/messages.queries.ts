import { db, messages, messageReads } from "../src";
import { and, eq, lt, sql, desc, or } from "drizzle-orm";
import type { NewMessage } from "../schema";

export const insertMessage = (data: NewMessage) =>
  db.insert(messages).values(data).returning();

export const getMessagePage = (roomId: string, cursor?: string, limit = 50) => {
  const where = cursor
    ? and(eq(messages.roomId, roomId), eq(messages.isDeleted, false), lt(messages.createdAt, new Date(cursor)))
    : and(eq(messages.roomId, roomId), eq(messages.isDeleted, false));
  return db.query.messages.findMany({
    where,
    with: { sender: { columns: { id: true, name: true, avatarUrl: true } } },
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    limit: limit + 1,
  });
};

export const getMessageById = (id: string) =>
  db.query.messages.findFirst({
    where: eq(messages.id, id),
    with: { sender: { columns: { id: true, name: true, avatarUrl: true } } },
  });

export const softDeleteMessage = (id: string) =>
  db.update(messages).set({ isDeleted: true, updatedAt: new Date() }).where(eq(messages.id, id)).returning();

export const searchMessages = (roomId: string, query: string) =>
  db.query.messages.findMany({
    where: and(
      eq(messages.roomId, roomId),
      eq(messages.isDeleted, false),
      sql`to_tsvector('english', ${messages.content}) @@ plainto_tsquery('english', ${query})`
    ),
    with: { sender: { columns: { id: true, name: true, avatarUrl: true } } },
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    limit: 50,
  });

export const insertMessageRead = (messageId: string, userId: string) =>
  db.insert(messageReads).values({ messageId, userId }).onConflictDoNothing().returning();

export const getUnreadCount = (roomId: string, userId: string) =>
  db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .leftJoin(messageReads, and(eq(messageReads.messageId, messages.id), eq(messageReads.userId, userId)))
    .where(and(eq(messages.roomId, roomId), eq(messages.isDeleted, false), sql`${messageReads.id} is null`));
