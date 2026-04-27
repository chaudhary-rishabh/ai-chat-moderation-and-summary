"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatStore } from "@/stores/chatStore";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMain } from "@/components/chat/ChatMain";
import { StoriesBar } from "@/components/chat/StoriesBar";
import { StoryViewer } from "@/components/chat/StoryViewer";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { roomsApi } from "@/lib/api/rooms.api";
import type { Story } from "@/types/chat.types";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useWebSocket();
  const setRooms = useChatStore((s) => s.setRooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  // Modal state
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [storyViewer, setStoryViewer] = useState<{
    stories: Story[];
    index: number;
  } | null>(null);

  // Fetch rooms on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    roomsApi
      .list()
      .then((data) => {
        setRooms(data);
        if (data.length > 0 && data[0]) {
          setActiveRoom(data[0].id);
        }
      })
      .catch(console.error);
  }, [status, router, setRooms, setActiveRoom]);

  const handleStoryClick = useCallback((stories: Story[], index: number) => {
    setStoryViewer({ stories, index });
  }, []);

  if (status !== "authenticated") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-ink-soft text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StoriesBar onStoryClick={handleStoryClick} />
        <ChatMain />
      </div>

      {/* Modals */}
      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
      {storyViewer && (
        <StoryViewer
          stories={storyViewer.stories}
          initialIndex={storyViewer.index}
          onClose={() => setStoryViewer(null)}
        />
      )}
    </main>
  );
}
