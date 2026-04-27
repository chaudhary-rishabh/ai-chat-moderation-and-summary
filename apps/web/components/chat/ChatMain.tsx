"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { PanelLeft, Hash, Users, MessageSquare, Phone, Video, Info, Wifi, WifiOff } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

export function ChatMain() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const { messages, loadMore, wsStatus } = useMessages(activeRoomId ?? null);
  const { send } = useWebSocket();

  const typingUsers = useChatStore((s) =>
    s.typingUsers.filter((t) => t.roomId === activeRoomId && t.isTyping),
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  // Scroll to bottom on room change
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [activeRoomId]);

  const handleDelete = useCallback(
    (messageId: string) => {
      send("msg:delete", { messageId, roomId: activeRoomId });
    },
    [send, activeRoomId],
  );

  // Empty state
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-20 glass rounded-xl p-2.5 hover:bg-white/20 transition"
          >
            <PanelLeft className="w-5 h-5 text-white/80" />
          </button>
        )}
        <div className="glass rounded-full p-6 mb-4">
          <MessageSquare className="w-10 h-10 text-white/40" />
        </div>
        <h2 className="text-xl font-semibold text-white/60 mb-1">Welcome to Glass Chat</h2>
        <p className="text-sm text-white/30">Select a conversation to start messaging</p>
      </div>
    );
  }

  const roomName =
    activeRoom.name ?? activeRoom.members.map((m) => m.user.name).join(", ");
  const roomIcon =
    activeRoom.type === "dm" ? (
      <MessageSquare className="w-4 h-4" />
    ) : activeRoom.type === "channel" ? (
      <Hash className="w-4 h-4" />
    ) : (
      <Users className="w-4 h-4" />
    );

  const isDm = activeRoom.type === "dm";
  const isOnline = isDm && activeRoom.members.some((m) => onlineUsers.has(m.userId));

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <header className="px-5 py-3 border-b border-white/8 flex items-center gap-3 shrink-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <PanelLeft className="w-4 h-4 text-white/70" />
          </button>
        )}

        <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center text-white/50 shrink-0">
          {activeRoom.avatarUrl ? (
            <img src={activeRoom.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            roomIcon
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white/90 truncate">{roomName}</h2>
          <p className="text-[11px] text-white/40">
            {typingUsers.length > 0
              ? typingUsers.map((t) => t.userName).join(", ") + " typing..."
              : isDm
                ? isOnline
                  ? "Online"
                  : "Offline"
                : activeRoom.members.length + " members"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {wsStatus === "connected" ? (
            <Wifi className="w-3.5 h-3.5 text-green-400/60" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400/60" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {isDm && (
            <>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <Phone className="w-4 h-4 text-white/50" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
                <Video className="w-4 h-4 text-white/50" />
              </button>
            </>
          )}
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <Info className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-1"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop < 100) loadMore();
        }}
      >
        {messages.length === 0 && (
          <div className="text-center text-white/25 text-sm mt-12">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onDelete={handleDelete} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
