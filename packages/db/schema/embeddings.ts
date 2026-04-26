/**
 * packages/db/schema/embeddings.ts
 *
 * Stores 1536-dimensional vector embeddings for messages.
 * Used by the hybrid RAG pipeline (pgvector cosine similarity + BM25).
 *
 * IMPORTANT: Requires PostgreSQL pgvector extension.
 * Run before first migration:
 *   CREATE EXTENSION IF NOT EXISTS vector;
 *
 * Run after Drizzle creates this table:
 *   CREATE INDEX IF NOT EXISTS embeddings_hnsw_cosine_idx
 *     ON embeddings
 *     USING hnsw (embedding vector_cosine_ops)
 *     WITH (m = 16, ef_construction = 64);
 */

import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
    customType,
} from "drizzle-orm/pg-core";
import { messages } from "./messages";

// ─── Custom pgvector column type ─────────────────────────────────────────────
// Drizzle does not have native pgvector support yet — we use customType.
// This serializes number[] to/from the PostgreSQL vector string format "[x,y,z]".

export const vector = customType<{
    data: number[];
    driverData: string;
    config: { dimensions: number };
}>({
    dataType(config) {
        return `vector(${config?.dimensions ?? 1536})`;
    },
    toDriver(value: number[]): string {
        return `[${value.join(",")}]`;
    },
    fromDriver(value: string): number[] {
        return value
            .replace(/[\[\]]/g, "")
            .split(",")
            .map(Number);
    },
});

// ─── Embeddings table ─────────────────────────────────────────────────────────

export const embeddings = pgTable(
    "embeddings",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // One embedding per message — enforced by unique constraint
        messageId: uuid("message_id")
            .notNull()
            .unique()
            .references(() => messages.id, { onDelete: "cascade" }),

        // 1536-dim vector from DeepSeek embedding endpoint
        // Stored as PostgreSQL vector type — requires pgvector extension
        embedding: vector("embedding", { dimensions: 1536 }).notNull(),

        // Track which model version generated this embedding
        // so we can re-embed if the model changes
        modelVersion: text("model_version").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        messageIdIdx: index("embeddings_message_id_idx").on(table.messageId),
        // NOTE: HNSW approximate nearest neighbour index must be created manually
        // via raw SQL after the table exists — see file header comment above.
        // Drizzle does not yet support HNSW index syntax in defineConfig.
    })
);

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;