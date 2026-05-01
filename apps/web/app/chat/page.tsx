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
import { useRooms } from "@/hooks/queries/useRooms";
import type { Story } from "@/types/chat.types";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useWebSocket();
  const setRooms = useChatStore((s) => s.setRooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const { data: rooms } = useRooms();

  // Modal state
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [storyViewer, setStoryViewer] = useState<{
    stories: Story[];
    index: number;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (rooms && rooms.length > 0 && rooms[0]) {
      setRooms(rooms);
      setActiveRoom(rooms[0].id);
    }
  }, [rooms, setRooms, setActiveRoom]);

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
