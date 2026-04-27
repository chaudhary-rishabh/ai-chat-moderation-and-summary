import { aiApi } from "@/lib/api/ai.api";
import { useAIStore } from "@/stores/aiStore";
import { useUIStore } from "@/stores/uiStore";

export const aiService = {
  fetchSummary: async (roomId: string, lang: string) => {
    const data = await aiApi.getSummary(roomId, lang);
    useUIStore.getState().setSummaryContent(data.content);
    return data;
  },

  fetchSuggestions: async (
    roomId: string,
    input: string,
    history?: Array<{ senderName: string; content: string }>,
  ) => {
    if (!input.trim()) {
      useUIStore.getState().setSuggestions([]);
      return [];
    }
    const data = await aiApi.getSuggestions({ roomId, content: input, history });
    useUIStore.getState().setSuggestions(data.suggestions);
    return data.suggestions;
  },

  openStream: (
    message: string,
    sessionId: string | undefined,
    onChunk: (content: string) => void,
    onDone: (citations: Array<{ messageId: string; senderName: string; snippet: string }>, sessionId: string) => void,
    onError: (error: string) => void,
  ): AbortController => {
    const controller = new AbortController();
    const store = useAIStore.getState();
    store.setStreaming(true);
    store.appendToBuffer("");

    const params = new URLSearchParams({ message });
    if (sessionId) params.set("sessionId", sessionId);

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai/chat/stream?${params.toString()}`;

    fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${(window as any).__accessToken ?? ""}`,
      },
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          onError("Failed to connect");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              store.flushBuffer();
              store.setStreaming(false);
              continue;
            }

            try {
              const parsed = JSON.parse(data) as {
                content?: string;
                citations?: Array<{ messageId: string; senderName: string; snippet: string }>;
                sessionId?: string;
              };
              if (parsed.content) {
                onChunk(parsed.content);
              }
              if (parsed.citations) {
                onDone(parsed.citations, parsed.sessionId ?? "");
              }
            } catch {
              // skip
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err.message);
        }
        store.setStreaming(false);
      });

    return controller;
  },
};
