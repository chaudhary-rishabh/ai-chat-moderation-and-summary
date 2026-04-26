import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { rooms } from "./rooms";

export const messageTypeEnum = pgEnum("message_type", [
    "text",
    "image",
    "video",
    "audio",
    "file",
    "system",
]);

export const messages = pgTable(
    "messages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        roomId: uuid("room_id")
            .notNull()
            .references(() => rooms.id, { onDelete: "cascade" }),
        senderId: uuid("sender_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        // Self-referencing FK for threaded replies
        threadParentId: uuid("thread_parent_id").references(
            (): any => messages.id,
            { onDelete: "set null" }
        ),
        type: messageTypeEnum("type").notNull().default("text"),
        content: text("content"),
        mediaUrl: text("media_url"),
        isDeleted: boolean("is_deleted").notNull().default(false),
        isFlagged: boolean("is_flagged").notNull().default(false),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        roomIdIdx: index("messages_room_id_idx").on(table.roomId),
        senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
        threadParentIdx: index("messages_thread_parent_id_idx").on(
            table.threadParentId
        ),
        // Composite index for fetching room messages in order
        roomCreatedIdx: index("messages_room_created_idx").on(
            table.roomId,
            table.createdAt
        ),
        flaggedIdx: index("messages_is_flagged_idx").on(table.isFlagged),
    })
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;