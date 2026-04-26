/**
 * packages/db/schema/ai_chat_sessions.ts
 *
 * Stores persistent AI direct chat sessions.
 * Each user has their own ongoing conversation with the AI assistant.
 * Messages are stored as JSONB to avoid a separate messages table for AI chats.
 *
 * The AI uses hybrid RAG over the user's own chat history
 * to answer questions like "what did I agree to with Maya last week?"
 */

import {
    pgTable,
    uuid,
    jsonb,
    integer,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── JSONB message shape (for TypeScript — not enforced at DB level) ──────────

export type AiMessage = {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string; // ISO string
};

// ─── AI Chat Sessions table ───────────────────────────────────────────────────

export const aiChatSessions = pgTable(
    "ai_chat_sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        // Full conversation history stored as JSONB array of AiMessage objects.
        // Schema: [{ role, content, timestamp }]
        // Trimmed to last N messages when context window approaches limit.
        messages: jsonb("messages").$type<AiMessage[]>().notNull().default([]),

        // Running total of tokens used — used for rate limiting and analytics
        tokenCount: integer("token_count").notNull().default(0),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        // Updated on every new message exchange
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userIdIdx: index("ai_chat_sessions_user_id_idx").on(table.userId),
        // For fetching the user's most recent sessions
        updatedAtIdx: index("ai_chat_sessions_updated_at_idx").on(table.updatedAt),
        // Composite: user's sessions sorted by last activity
        userUpdatedIdx: index("ai_chat_sessions_user_updated_idx").on(
            table.userId,
            table.updatedAt
        ),
    })
);

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type NewAiChatSession = typeof aiChatSessions.$inferInsert;