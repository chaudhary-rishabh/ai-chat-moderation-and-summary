import { NotFoundError, ForbiddenError } from "../lib/errors";
import {
  createStory,
  getActiveFeedForUser,
  getStoryById,
  deleteStory,
  expireStories,
  upsertStoryView,
  upsertStoryReaction,
  getStoryViewers,
} from "db/queries";

export const createStoryService = async (userId: string, data: { mediaType: "image" | "video" | "text"; mediaUrl?: string; caption?: string; bgColor?: string }) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [story] = await createStory({
    userId,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl ?? null,
    caption: data.caption ?? null,
    bgColor: data.bgColor ?? null,
    expiresAt,
  });
  if (!story) throw new Error("Failed to create story");
  return story;
};

export const getFeedService = async (userId: string) => {
  const stories = await getActiveFeedForUser(userId);

  // Group by user
  const grouped = new Map<string, { user: any; stories: any[] }>();
  for (const story of stories) {
    if (!grouped.has(story.userId)) {
      grouped.set(story.userId, { user: story.user, stories: [] });
    }
    grouped.get(story.userId)!.stories.push(story);
  }

  return Array.from(grouped.values());
};

export const viewStoryService = async (storyId: string, viewerId: string) => {
  const story = await getStoryById(storyId);
  if (!story) throw new NotFoundError("Story not found", "STORY_NOT_FOUND");
  if (!story.isActive || story.expiresAt < new Date()) throw new NotFoundError("Story expired", "STORY_EXPIRED");

  await upsertStoryView(storyId, viewerId);
  return { viewed: true };
};

export const reactToStoryService = async (storyId: string, userId: string, emoji: string) => {
  const story = await getStoryById(storyId);
  if (!story) throw new NotFoundError("Story not found", "STORY_NOT_FOUND");
  if (!story.isActive || story.expiresAt < new Date()) throw new NotFoundError("Story expired", "STORY_EXPIRED");

  return upsertStoryReaction({ storyId, userId, emoji });
};

export const deleteStoryService = async (storyId: string, userId: string) => {
  const story = await getStoryById(storyId);
  if (!story) throw new NotFoundError("Story not found", "STORY_NOT_FOUND");
  if (story.userId !== userId) throw new ForbiddenError("Can only delete your own stories", "NOT_OWNER");

  return deleteStory(storyId);
};

export const getStoryViewersService = async (storyId: string, userId: string) => {
  const story = await getStoryById(storyId);
  if (!story) throw new NotFoundError("Story not found", "STORY_NOT_FOUND");
  if (story.userId !== userId) throw new ForbiddenError("Can only view viewers of your own stories", "NOT_OWNER");

  return getStoryViewers(storyId);
};

export const expireStoriesService = async () => {
  return expireStories();
};
