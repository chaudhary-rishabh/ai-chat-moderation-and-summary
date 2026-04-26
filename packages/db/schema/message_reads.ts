import {
    pgTable,
    uuid,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { messages } from "./messages";

export const messageReads = pgTable(
    "message_reads",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        // One read record per user per message
        messageUserUnique: uniqueIndex("message_reads_message_user_unique").on(
            table.messageId,
            table.userId
        ),
        messageIdIdx: index("message_reads_message_id_idx").on(table.messageId),
        userIdIdx: index("message_reads_user_id_idx").on(table.userId),
    })
);

export type MessageRead = typeof messageReads.$inferSelect;
export type NewMessageRead = typeof messageReads.$inferInsert;