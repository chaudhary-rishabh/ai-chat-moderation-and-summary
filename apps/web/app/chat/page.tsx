"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatStore } from "@/stores/chatStore";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMain } from "@/components/chat/ChatMain";
import axios from "@/lib/axios";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { status: wsStatus } = useWebSocket();
  const setRooms = useChatStore((s) => s.setRooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  // Fetch rooms on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    axios
      .get("/api/rooms")
      .then(({ data }) => {
        setRooms(data);
        if (data.length > 0) {
          setActiveRoom(data[0].id);
        }
      })
      .catch(console.error);
  }, [status, router, setRooms, setActiveRoom]);

  if (status !== "authenticated") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-white/60 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex overflow-hidden">
      <ChatSidebar />
      <ChatMain />
    </main>
  );
}
