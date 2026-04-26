/**
 * packages/db/schema/threads.ts
 *
 * Thread tracking table. A thread is created when any message receives
 * its first reply via threadParentId. This table stores thread-level
 * metadata (reply count, last reply time) so the UI can show thread
 * previews without counting replies on every query.
 *
 * The actual reply messages live in the messages table with
 * threadParentId pointing to the root message.
 */

import {
    pgTable,
    uuid,
    integer,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { messages } from "./messages";
import { rooms } from "./rooms";

export const threads = pgTable(
    "threads",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // The root message that started this thread
        rootMessageId: uuid("root_message_id")
            .notNull()
            .unique()
            .references(() => messages.id, { onDelete: "cascade" }),

        // Denormalized for quick sidebar queries — avoids joining messages
        roomId: uuid("room_id")
            .notNull()
            .references(() => rooms.id, { onDelete: "cascade" }),

        // Total number of replies (excluding the root message itself)
        replyCount: integer("reply_count").notNull().default(0),

        // Timestamp of the most recent reply — used for sorting threads
        lastReplyAt: timestamp("last_reply_at", { withTimezone: true }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        // One thread record per root message
        rootMessageUnique: uniqueIndex("threads_root_message_unique").on(
            table.rootMessageId
        ),
        roomIdIdx: index("threads_room_id_idx").on(table.roomId),
        lastReplyIdx: index("threads_last_reply_at_idx").on(table.lastReplyAt),
        // Composite: fetch all threads in a room ordered by last activity
        roomLastReplyIdx: index("threads_room_last_reply_idx").on(
            table.roomId,
            table.lastReplyAt
        ),
    })
);

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;