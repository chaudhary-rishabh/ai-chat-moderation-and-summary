"use client";

import { useEffect } from "react";
import { useWebSocket } from "./useWebSocket";
import { useChatStore } from "@/stores/chatStore";

export function usePresence() {
  const { send, status } = useWebSocket();
  const onlineUsers = useChatStore((s) => s.onlineUsers);

  // Send presence ping every 25 seconds (server TTL is 35s)
  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      send("presence:ping", {});
    }, 25_000);
    return () => clearInterval(interval);
  }, [send, status]);

  return { onlineUsers, isConnected: status === "connected" };
}
