import type { ChatMessage } from "@/types/chat.types";
import api from "./client";

interface MessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export const messagesApi = {
  list: (roomId: string, cursor?: string | null, limit = 50) =>
    api
      .get<MessagesResponse>(`/api/rooms/${roomId}/messages`, {
        params: { cursor, limit },
      })
      .then((r) => r.data),

  delete: (roomId: string, messageId: string) =>
    api.delete(`/api/rooms/${roomId}/messages/${messageId}`).then((r) => r.data),

  search: (roomId: string, query: string) =>
    api
      .get<ChatMessage[]>(`/api/rooms/${roomId}/messages/search`, { params: { q: query } })
      .then((r) => r.data),
};
