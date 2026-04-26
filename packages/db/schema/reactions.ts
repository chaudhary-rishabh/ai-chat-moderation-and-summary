import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { messages } from "./messages";

export const reactions = pgTable(
    "reactions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        // Store as unicode emoji string e.g. "👍", "❤️"
        emoji: text("emoji").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        // One emoji per user per message — user can react with different emojis
        // but not the same emoji twice
        messageUserEmojiUnique: uniqueIndex(
            "reactions_message_user_emoji_unique"
        ).on(table.messageId, table.userId, table.emoji),
        messageIdIdx: index("reactions_message_id_idx").on(table.messageId),
        userIdIdx: index("reactions_user_id_idx").on(table.userId),
    })
);

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;