"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useWebSocket } from "./useWebSocket";
import { messagesApi } from "@/lib/api/messages.api";
import type { MsgSendPayload } from "@repo/types/ws-events";

export function useMessages(roomId: string | null) {
  const { send, status } = useWebSocket();
  const store = useChatStore();
  const isLoadingRef = useRef(false);
  const cursorRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await messagesApi.list(roomId, null, 50);
      store.setMessages(roomId, data.messages);
      cursorRef.current = data.nextCursor;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      isLoadingRef.current = false;
    }
  }, [roomId, store]);

  const loadMore = useCallback(async () => {
    if (!roomId || !cursorRef.current || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await messagesApi.list(roomId, cursorRef.current, 50);
      store.prependMessages(roomId, data.messages);
      cursorRef.current = data.nextCursor;
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      isLoadingRef.current = false;
    }
  }, [roomId, store]);

  const sendMessage = useCallback(
    (content: string, type: MsgSendPayload["type"] = "text", threadParentId?: string) => {
      if (!roomId || !content.trim()) return;
      send("msg:send", {
        roomId,
        content: content.trim(),
        type,
        threadParentId,
      } satisfies MsgSendPayload);
    },
    [roomId, send],
  );

  const sendTypingStart = useCallback(() => {
    if (!roomId) return;
    send("typing:start", { roomId });
  }, [roomId, send]);

  const sendTypingStop = useCallback(() => {
    if (!roomId) return;
    send("typing:stop", { roomId });
  }, [roomId, send]);

  useEffect(() => {
    if (roomId) {
      cursorRef.current = null;
      fetchMessages();
    }
  }, [roomId, fetchMessages]);

  return {
    messages: roomId ? (store.messages[roomId] ?? []) : [],
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    loadMore,
    wsStatus: status,
  };
}
