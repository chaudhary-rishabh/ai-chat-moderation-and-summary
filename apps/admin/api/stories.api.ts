import { apiClient } from "./client";
import type { AdminStory } from "@/types/admin.types";

export const storiesApi = {
  active: () =>
    apiClient.get<{ rows: AdminStory[]; total: number }>("/stories").then((r) => r.data),

  delete: (storyId: string) =>
    apiClient.delete<{ success: boolean }>(`/stories/${storyId}`).then((r) => r.data),
};
