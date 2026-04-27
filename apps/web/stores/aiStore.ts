import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AIState {
  isStreaming: boolean;
  aiMessages: Array<{ role: "user" | "assistant"; content: string }>;
  streamBuffer: string;

  addMessage: (role: "user" | "assistant", content: string) => void;
  setStreaming: (v: boolean) => void;
  appendToBuffer: (chunk: string) => void;
  flushBuffer: () => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>()(
  immer((set) => ({
    isStreaming: false,
    aiMessages: [],
    streamBuffer: "",

    addMessage: (role, content) =>
      set((s) => {
        s.aiMessages.push({ role, content });
      }),

    setStreaming: (v) =>
      set((s) => {
        s.isStreaming = v;
      }),

    appendToBuffer: (chunk) =>
      set((s) => {
        s.streamBuffer += chunk;
      }),

    flushBuffer: () =>
      set((s) => {
        if (s.streamBuffer) {
          s.aiMessages.push({ role: "assistant", content: s.streamBuffer });
          s.streamBuffer = "";
        }
      }),

    clearMessages: () =>
      set((s) => {
        s.aiMessages = [];
        s.streamBuffer = "";
      }),
  })),
);
