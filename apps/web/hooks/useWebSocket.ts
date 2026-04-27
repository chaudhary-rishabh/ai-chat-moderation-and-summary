"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/stores/chatStore";
import type { ServerToClientEvent } from "@repo/types/ws-events";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
const MAX_BACKOFF = 30_000;

function getWsUrl(token: string) {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000").replace(/^http/, "ws");
  return `${base}?token=${token}`;
}

function connect(token: string): WebSocket {
  if (ws?.readyState === WebSocket.OPEN) return ws;

  const socket = new WebSocket(getWsUrl(token));
  ws = socket;

  socket.onopen = () => {
    reconnectAttempt = 0;
    notifyStatus("connected");
  };

  socket.onmessage = (event) => {
    try {
      const evt = JSON.parse(event.data) as ServerToClientEvent;
      handleEvent(evt);
    } catch {
      // ignore parse errors
    }
  };

  socket.onclose = () => {
    notifyStatus("disconnected");
    ws = null;
    scheduleReconnect(token);
  };

  socket.onerror = () => {
    socket.close();
  };

  return socket;
}

function scheduleReconnect(token: string) {
  if (reconnectTimer) return;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), MAX_BACKOFF);
  reconnectAttempt++;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect(token);
  }, delay);
}

// Simple event emitter for status changes
const statusListeners = new Set<(s: ConnectionStatus) => void>();
let currentStatus: ConnectionStatus = "disconnected";

function notifyStatus(s: ConnectionStatus) {
  currentStatus = s;
  statusListeners.forEach((fn) => fn(s));
}

function handleEvent(event: ServerToClientEvent) {
  const store = useChatStore.getState();
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
      store.setPresence(event.payload.userId, {
        status: event.payload.status,
        lastSeenAt: event.payload.lastSeenAt,
      });
      break;
    case "reaction:update":
      // Reactions are handled within the message object
      break;
    case "safety:alert":
      // Admin-only; handled elsewhere
      break;
  }
}

export function useWebSocket() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<ConnectionStatus>(currentStatus);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    statusListeners.add(setStatus);
    return () => {
      statusListeners.delete(setStatus);
    };
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;

    const socket = connect(session.accessToken);

    pingRef.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "presence:ping", payload: {} }));
      }
    }, 25_000);

    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [session?.accessToken]);

  const send = useCallback((type: string, payload: unknown) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { status, send };
}
