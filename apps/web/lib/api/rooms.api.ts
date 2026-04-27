import type { ChatRoom } from "@/types/chat.types";
import api from "./client";

export const roomsApi = {
  list: () => api.get<ChatRoom[]>("/api/rooms").then((r) => r.data),

  get: (roomId: string) => api.get<ChatRoom>(`/api/rooms/${roomId}`).then((r) => r.data),

  create: (data: { type: string; name?: string; memberIds: string[] }) =>
    api.post<ChatRoom>("/api/rooms", data).then((r) => r.data),

  addMember: (roomId: string, userId: string) =>
    api.post(`/api/rooms/${roomId}/members`, { userId }).then((r) => r.data),

  removeMember: (roomId: string, userId: string) =>
    api.delete(`/api/rooms/${roomId}/members/${userId}`).then((r) => r.data),
};
