"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMain } from "@/components/chat/ChatMain";
import { StoriesBar } from "@/components/chat/StoriesBar";
import { StoryViewer } from "@/components/chat/StoryViewer";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { useRooms } from "@/hooks/queries/useRooms";
import { PanelLeft } from "lucide-react";
import type { Story } from "@/types/chat.types";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useWebSocket();
  const setRooms = useChatStore((s) => s.setRooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
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
      <div className="h-screen flex items-center justify-center bg-[#1a2d45]">
        <div className="glass rounded-2xl px-6 py-4 text-ink-soft text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex overflow-hidden relative bg-[#1a2d45]">
      {/* Background mesh gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-5%] top-[-15%] h-[600px] w-[600px] rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[-15%] h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
        <div className="absolute left-[40%] top-[20%] h-[350px] w-[350px] rounded-full bg-cyan-400/6 blur-[100px]" />
        <div className="absolute right-[25%] top-[50%] h-[250px] w-[250px] rounded-full bg-blue-400/6 blur-[80px]" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating sidebar toggle — always visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="absolute left-5 top-5 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl glass-strong hover:bg-white/35 transition-all duration-200 shadow-lg group"
            title="Open sidebar"
          >
            <PanelLeft className="w-5 h-5 text-ink-soft group-hover:text-ink transition-colors" />
          </button>
        </div>
      )}

      <ChatSidebar onNewChat={() => setNewChatOpen(true)} />

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
