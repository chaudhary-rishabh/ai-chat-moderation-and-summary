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

export const storyMediaTypeEnum = pgEnum("story_media_type", [
    "image",
    "video",
    "text",
]);

export const stories = pgTable(
    "stories",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        mediaType: storyMediaTypeEnum("media_type").notNull(),
        mediaUrl: text("media_url"),
        caption: text("caption"),
        bgColor: text("bg_color"),
        // Stories auto-expire after 24 hours — set by app logic on insert
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userIdIdx: index("stories_user_id_idx").on(table.userId),
        expiresAtIdx: index("stories_expires_at_idx").on(table.expiresAt),
        // Partial index: only index active stories — used by expiry worker queries
        activeIdx: index("stories_is_active_idx").on(table.isActive),
    })
);

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;