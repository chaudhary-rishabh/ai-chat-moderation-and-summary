"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSafetyStore } from "@/stores/safetyStore";

export function useAdminWs() {
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const addLiveFlag = useSafetyStore((s) => s.addLiveFlag);
  const setWsConnected = useSafetyStore((s) => s.setWsConnected);

  const connect = useCallback(() => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000"}?token=${token}`,
    );
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "safety_flag" && data.flag) {
          addLiveFlag(data.flag);
        }
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      ws.close();
    };
  }, [session, addLiveFlag, setWsConnected]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);
}
