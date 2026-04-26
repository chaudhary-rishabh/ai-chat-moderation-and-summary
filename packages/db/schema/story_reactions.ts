/**
 * packages/db/schema/story_reactions.ts
 *
 * Emoji reactions to stories (like Instagram story reactions).
 * One reaction per user per story — user can change their reaction
 * by upserting. Uses the same emoji string format as message reactions.
 */

import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stories } from "./stories";

export const storyReactions = pgTable(
    "story_reactions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        storyId: uuid("story_id")
            .notNull()
            .references(() => stories.id, { onDelete: "cascade" }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        // Unicode emoji string e.g. "❤️", "😂", "🔥"
        emoji: text("emoji").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),

        // Updated when user changes their reaction (upsert)
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        // One reaction per user per story — upsert on conflict
        storyUserUnique: uniqueIndex("story_reactions_story_user_unique").on(
            table.storyId,
            table.userId
        ),
        storyIdIdx: index("story_reactions_story_id_idx").on(table.storyId),
        userIdIdx: index("story_reactions_user_id_idx").on(table.userId),
    })
);

export type StoryReaction = typeof storyReactions.$inferSelect;
export type NewStoryReaction = typeof storyReactions.$inferInsert;