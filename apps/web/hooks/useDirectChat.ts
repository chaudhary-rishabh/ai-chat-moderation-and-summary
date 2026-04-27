"use client";

import { useState, useCallback, useRef } from "react";
import { useAIStore } from "@/stores/aiStore";
import { aiService } from "@/services/ai.service";

export function useDirectChat() {
  const isStreaming = useAIStore((s) => s.isStreaming);
  const aiMessages = useAIStore((s) => s.aiMessages);
  const addMessage = useAIStore((s) => s.addMessage);
  const appendToBuffer = useAIStore((s) => s.appendToBuffer);
  const flushBuffer = useAIStore((s) => s.flushBuffer);
  const setStreaming = useAIStore((s) => s.setStreaming);
  const clearMessages = useAIStore((s) => s.clearMessages);

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isStreaming) return;

      addMessage("user", content);
      setStreaming(true);

      const controller = aiService.openStream(
        content,
        sessionId,
        (chunk: string) => {
          appendToBuffer(chunk);
        },
        (citations: Array<{ messageId: string; senderName: string; snippet: string }>, newSessionId: string) => {
          flushBuffer();
          if (newSessionId) setSessionId(newSessionId);
        },
        (error: string) => {
          appendToBuffer(`Error: ${error}`);
          flushBuffer();
          setStreaming(false);
        },
      );

      abortRef.current = controller;
    },
    [isStreaming, sessionId, addMessage, setStreaming, appendToBuffer, flushBuffer],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    flushBuffer();
  }, [setStreaming, flushBuffer]);

  return {
    messages: aiMessages,
    isStreaming,
    sessionId,
    sendMessage,
    cancel,
    clearMessages,
  };
}
