import type { Story } from "@/types/chat.types";
import api from "./client";

export const storiesApi = {
  feed: () => api.get<Story[]>("/api/stories/feed").then((r) => r.data),

  create: (mediaUrl: string, caption?: string) =>
    api.post<Story>("/api/stories", { mediaUrl, caption }).then((r) => r.data),

  view: (storyId: string) =>
    api.post(`/api/stories/${storyId}/view`).then((r) => r.data),

  react: (storyId: string, emoji: string) =>
    api.post(`/api/stories/${storyId}/react`, { emoji }).then((r) => r.data),

  delete: (storyId: string) =>
    api.delete(`/api/stories/${storyId}`).then((r) => r.data),
};
