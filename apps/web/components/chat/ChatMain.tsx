"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { AIPanel } from "./AIPanel";
import { SummaryPanel } from "./SummaryPanel";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function ChatMain() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const typingUsersRaw = useChatStore((s) => s.typingUsers);
  const typingUsers = typingUsersRaw.filter((t) => t.roomId === activeRoomId && t.isTyping);
  const panelMode = useUIStore((s) => s.panelMode);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const { messages, loadMore, wsStatus } = useMessages(activeRoomId ?? null);
  const { send } = useWebSocket();

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

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      send("reaction:add", { roomId: activeRoomId, messageId, emoji });
    },
    [send, activeRoomId],
  );

  // Empty state
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="glass-soft rounded-full p-6 mb-4">
          <MessageSquare className="w-10 h-10 text-ink-faint" />
        </div>
        <h2 className="text-xl font-semibold text-ink-soft mb-1">
          Welcome to Glass Chat
        </h2>
        <p className="text-sm text-ink-faint">
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-w-0">
      {/* Main chat area */}
      <div className={`flex-1 flex flex-col h-full min-w-0 ${panelMode !== "chat" ? "hidden md:flex" : ""}`}>
        <ChatHeader />

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
            <div className="text-center text-ink-faint text-sm mt-12">
              No messages yet. Say hello!
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onDelete={handleDelete}
              onReact={handleReact}
            />
          ))}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
          <div ref={bottomRef} />
        </div>

        <ChatInput />
      </div>

      {/* Side panels */}
      {panelMode === "ai" && <AIPanel />}
      {panelMode === "summary" && <SummaryPanel />}
    </div>
  );
}
