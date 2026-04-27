import api from "./client";

export const aiApi = {
  getSummary: (roomId: string, lang = "en") =>
    api.get(`/api/ai/summarize/${roomId}?lang=${lang}`).then((r) => r.data),

  getSuggestions: (data: { roomId: string; content: string; history?: Array<{ senderName: string; content: string }> }) =>
    api.post<{ suggestions: string[] }>("/api/ai/suggest", data).then((r) => r.data),

  directChat: (message: string, sessionId?: string) =>
    api
      .post<{ response: string; citations: Array<{ messageId: string; senderName: string; snippet: string }>; sessionId: string }>(
        "/api/ai/chat",
        { message, sessionId },
      )
      .then((r) => r.data),

  getChatSession: () =>
    api
      .get<{ sessionId: string; messages: Array<{ role: string; content: string; timestamp: string }>; tokenCount: number }>(
        "/api/ai/chat/session",
      )
      .then((r) => r.data),
};
