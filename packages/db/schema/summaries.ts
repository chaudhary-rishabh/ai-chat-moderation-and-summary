/**
 * packages/db/schema/summaries.ts
 *
 * Stores AI-generated chat summaries produced by Gemini 2.5 Flash.
 * One summary per (room, language, time window) — multiple summaries
 * can exist for the same room in different languages or at different times.
 */

import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { users } from "./users";

export const summaries = pgTable(
    "summaries",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        roomId: uuid("room_id")
            .notNull()
            .references(() => rooms.id, { onDelete: "cascade" }),

        // Full summary text — may be in any language based on targetLanguage
        content: text("content").notNull(),

        // BCP-47 language tag of the output e.g. "en", "hi", "es", "fr", "de"
        language: text("language").notNull().default("en"),

        // How many messages were included in this summary window
        messageCount: integer("message_count").notNull(),

        // null = triggered by a scheduled job, not a user
        createdBy: uuid("created_by").references(() => users.id, {
            onDelete: "set null",
        }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        roomIdIdx: index("summaries_room_id_idx").on(table.roomId),
        // Composite: latest summary for a room in a given language
        roomLangIdx: index("summaries_room_lang_idx").on(
            table.roomId,
            table.language
        ),
        roomCreatedIdx: index("summaries_room_created_idx").on(
            table.roomId,
            table.createdAt
        ),
    })
);

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;