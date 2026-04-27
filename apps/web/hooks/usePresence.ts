"use client";

import { useChatStore } from "@/stores/chatStore";
import { useWebSocket } from "./useWebSocket";

export function usePresence() {
  const { status } = useWebSocket();
  const presence = useChatStore((s) => s.presence);

  const isOnline = (userId: string) => {
    const info = presence.get(userId);
    return info?.status === "online";
  };

  const onlineUsers = () => {
    const online = new Set<string>();
    presence.forEach((info, userId) => {
      if (info.status === "online") online.add(userId);
    });
    return online;
  };

  return { presence, isOnline, onlineUsers: onlineUsers(), isConnected: status === "connected" };
}
