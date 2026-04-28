import { apiClient } from "./client";
import type { AdminRoom, AdminRoomDetail, PaginatedResponse } from "@/types/admin.types";

export const roomsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<AdminRoom>>("/rooms", { params }).then((r) => r.data),

  detail: (roomId: string) =>
    apiClient.get<AdminRoomDetail>(`/rooms/${roomId}`).then((r) => r.data),

  archive: (roomId: string) =>
    apiClient.put<{ success: boolean }>(`/rooms/${roomId}/archive`).then((r) => r.data),

  deleteMessage: (messageId: string) =>
    apiClient.delete<{ success: boolean }>(`/messages/${messageId}`).then((r) => r.data),
};
