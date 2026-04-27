import { db, stories, storyViews, storyReactions } from "../src";
import { and, eq, lt, sql, isNull } from "drizzle-orm";
import type { NewStory, NewStoryView, NewStoryReaction } from "../schema";

export const createStory = (data: NewStory) =>
  db.insert(stories).values(data).returning();

export const getActiveFeedForUser = (userId: string) =>
  db.query.stories.findMany({
    where: and(eq(stories.isActive, true), sql`${stories.expiresAt} > now()`),
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
      views: { where: eq(storyViews.viewerId, userId), limit: 1 },
    },
    orderBy: (stories, { desc }) => [desc(stories.createdAt)],
  });

export const getStoryById = (id: string) =>
  db.query.stories.findFirst({ where: eq(stories.id, id) });

export const deleteStory = (id: string) =>
  db.update(stories).set({ isActive: false }).where(eq(stories.id, id)).returning();

export const expireStories = () =>
  db.update(stories).set({ isActive: false }).where(and(eq(stories.isActive, true), sql`${stories.expiresAt} <= now()`)).returning();

export const upsertStoryView = (storyId: string, viewerId: string) =>
  db.insert(storyViews).values({ storyId, viewerId }).onConflictDoNothing().returning();

export const upsertStoryReaction = (data: { storyId: string; userId: string; emoji: string }) =>
  db
    .insert(storyReactions)
    .values(data)
    .onConflictDoUpdate({
      target: [storyReactions.storyId, storyReactions.userId],
      set: { emoji: data.emoji, updatedAt: new Date() },
    })
    .returning();

export const getStoryViewers = (storyId: string) =>
  db.query.storyViews.findMany({
    where: eq(storyViews.storyId, storyId),
    with: { viewer: { columns: { id: true, name: true, avatarUrl: true } } },
    orderBy: (views, { desc }) => [desc(views.viewedAt)],
  });
