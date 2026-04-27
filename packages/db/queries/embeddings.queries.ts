import { db, embeddings, messages } from "../src";
import { sql, eq, inArray } from "drizzle-orm";

export const insertEmbedding = (messageId: string, vector: number[], modelVersion: string) =>
  db
    .insert(embeddings)
    .values({ messageId, embedding: vector as any, modelVersion })
    .onConflictDoUpdate({
      target: embeddings.messageId,
      set: { embedding: vector as any, modelVersion },
    })
    .returning();

export const vectorSearch = (
  queryVector: number[],
  limit: number,
  roomId?: string,
) =>
  db.execute(sql`
    SELECT e.message_id, e.embedding <=> ${`[${queryVector.join(",")}]`}::vector AS score
    FROM embeddings e
    JOIN messages m ON m.id = e.message_id
    WHERE m.is_deleted = false
    ${roomId ? sql`AND m.room_id = ${roomId}::uuid` : sql``}
    ORDER BY score ASC
    LIMIT ${limit}
  `);

export const bm25Search = (query: string, limit: number, roomId?: string) =>
  db.execute(sql`
    SELECT m.id AS message_id,
           ts_rank(to_tsvector('english', coalesce(m.content, '')), plainto_tsquery('english', ${query})) AS score
    FROM messages m
    WHERE m.is_deleted = false
      AND to_tsvector('english', coalesce(m.content, '')) @@ plainto_tsquery('english', ${query})
      ${roomId ? sql`AND m.room_id = ${roomId}::uuid` : sql``}
    ORDER BY score DESC
    LIMIT ${limit}
  `);

export const getMessagesByIds = (ids: string[]) =>
  db.query.messages.findMany({
    where: inArray(messages.id, ids),
    with: { sender: { columns: { id: true, name: true, avatarUrl: true } } },
    limit: ids.length,
  });
