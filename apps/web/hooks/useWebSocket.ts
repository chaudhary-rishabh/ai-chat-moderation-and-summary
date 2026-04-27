"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/stores/chatStore";
import type { ServerToClientEvent } from "@repo/types/ws-events";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useWebSocket() {
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const store = useChatStore();

  const connect = useCallback(() => {
    if (!session?.accessToken) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^http/, "ws") ?? "ws://localhost:4000";
    const ws = new WebSocket(`${serverUrl}?token=${session.accessToken}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const evt = JSON.parse(event.data) as ServerToClientEvent;
        handleEvent(evt, store);
      } catch {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [session?.accessToken, store]);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [session?.accessToken, connect, disconnect]);

  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { status, send, connect, disconnect };
}

function handleEvent(event: ServerToClientEvent, store: ReturnType<typeof useChatStore.getState>) {
  switch (event.type) {
    case "msg:new":
      store.addMessage(event.payload.message.roomId, event.payload.message);
      break;
    case "msg:deleted":
      store.deleteMessage(event.payload.roomId, event.payload.messageId);
      break;
    case "typing:update":
      store.setTyping(
        event.payload.roomId,
        event.payload.userId,
        event.payload.userName,
        event.payload.isTyping,
      );
      break;
    case "presence:update":
      store.setOnline(event.payload.userId, event.payload.status === "online");
      break;
    case "reaction:update":
      // Reactions are handled via the message object's reactions array
      break;
    case "safety:alert":
      // Safety alerts are admin-only; handled separately
      break;
  }
}
