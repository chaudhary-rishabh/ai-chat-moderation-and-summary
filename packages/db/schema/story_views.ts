/**
 * packages/db/schema/story_views.ts
 *
 * Tracks which users have viewed which stories.
 * One record per viewer per story (upsert on view).
 * Used to: show view count to story owner, mark stories as seen in the UI.
 */

import {
    pgTable,
    uuid,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { stories } from "./stories";

export const storyViews = pgTable(
    "story_views",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        storyId: uuid("story_id")
            .notNull()
            .references(() => stories.id, { onDelete: "cascade" }),

        viewerId: uuid("viewer_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        // When the view was first recorded (upsert — does not update on re-view)
        viewedAt: timestamp("viewed_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        // One view record per viewer per story — enforces upsert semantics
        storyViewerUnique: uniqueIndex("story_views_story_viewer_unique").on(
            table.storyId,
            table.viewerId
        ),
        storyIdIdx: index("story_views_story_id_idx").on(table.storyId),
        viewerIdIdx: index("story_views_viewer_id_idx").on(table.viewerId),
    })
);

export type StoryView = typeof storyViews.$inferSelect;
export type NewStoryView = typeof storyViews.$inferInsert;