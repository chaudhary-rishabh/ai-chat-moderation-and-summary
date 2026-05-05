"use client";

import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { usePresence } from "@/hooks/usePresence";
import {
  Search,
  Hash,
  Users,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Sparkles,
  Compass,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { ChatRoom } from "@/types/chat.types";

export function ChatSidebar({ onNewChat }: { onNewChat?: () => void }) {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const setPanelMode = useUIStore((s) => s.setPanelMode);
  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const { isOnline } = usePresence();

  const filteredRooms = searchQuery
    ? rooms.filter((r) => {
        const name = r.name ?? r.members.map((m) => m.user.name).join(", ");
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : rooms;

  if (!sidebarOpen) return null;

  return (
    <aside className="w-80 m-5 h-[calc(100vh-40px)] glass rounded-[35px] flex flex-col shrink-0 z-10">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <h1 className="text-base font-semibold text-ink tracking-tight">Chats</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAIPanel}
            className="p-1.5 rounded-lg hover:bg-white/18 transition"
            title="AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-ai-accent" />
          </button>
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg hover:bg-white/18 transition"
            title="New conversation"
          >
            <Plus className="w-4 h-4 text-ink-soft" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/18 transition"
          >
            <PanelLeftClose className="w-4 h-4 text-ink-soft" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-ink-faint shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none w-full"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-ink-faint text-sm mt-12">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>{searchQuery ? "No rooms found" : "No conversations yet"}</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isActive={room.id === activeRoomId}
              onClick={() => {
                setActiveRoom(room.id);
                setPanelMode("chat");
              }}
              isOnline={
                room.type === "dm" &&
                room.members.some((m) => isOnline(m.userId))
              }
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-ink-faint">
        <button
          onClick={() => setPanelMode("ai")}
          className="flex items-center gap-1.5 hover:text-ai-accent transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI</span>
        </button>
        <button
          onClick={() => setPanelMode("summary")}
          className="flex items-center gap-1.5 hover:text-summary-accent transition"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Summarize</span>
        </button>
        <span>{rooms.length} conversations</span>
      </div>
    </aside>
  );
}

function RoomCard({
  room,
  isActive,
  onClick,
  isOnline,
}: {
  room: ChatRoom;
  isActive: boolean;
  onClick: () => void;
  isOnline: boolean;
}) {
  const name = room.name ?? room.members.map((m) => m.user.name).join(", ");
  const lastMsg = room.messages?.[0];
  const icon =
    room.type === "dm" ? (
      <MessageSquare className="w-4 h-4" />
    ) : room.type === "channel" ? (
      <Hash className="w-4 h-4" />
    ) : (
      <Users className="w-4 h-4" />
    );

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-[14px] mb-1 transition-all duration-150 flex items-center gap-3",
        "hover:bg-white/10",
        isActive
          ? "bg-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)]"
          : "border border-transparent",
      )}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl glass-soft flex items-center justify-center text-ink-soft">
          {room.avatarUrl ? (
            <img
              src={room.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            icon
          )}
        </div>
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online rounded-full border-2 border-chat-bg" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate text-ink">{name}</span>
          {lastMsg && (
            <span className="text-[10px] text-ink-faint shrink-0 ml-2">
              {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-ink-soft truncate">
            {lastMsg?.content ?? "No messages yet"}
          </span>
          {(room.unreadCount ?? 0) > 0 && (
            <span className="bg-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-2">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
