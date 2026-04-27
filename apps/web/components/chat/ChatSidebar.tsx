"use client";

import { useChatStore, type ChatRoom } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { usePresence } from "@/hooks/usePresence";
import { Search, Hash, Users, MessageSquare, PanelLeftClose, Plus } from "lucide-react";

export function ChatSidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  usePresence();

  const filteredRooms = searchQuery
    ? rooms.filter((r) => r.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : rooms;

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="w-80 h-full glass border-r-0 rounded-r-2xl flex flex-col shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Chats</h1>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <Plus className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <PanelLeftClose className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-white/30 text-sm mt-12">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>{searchQuery ? "No rooms found" : "No conversations yet"}</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isActive={room.id === activeRoomId}
              onClick={() => setActiveRoom(room.id)}
              isOnline={room.type === "dm" && room.members.some((m) => onlineUsers.has(m.userId))}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 text-xs text-white/40">
        {onlineUsers.size} online
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
      className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all duration-150 flex items-center gap-3 ${
        isActive
          ? "bg-white/20 border border-white/25"
          : "hover:bg-white/8 border border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center text-white/60">
          {room.avatarUrl ? (
            <img src={room.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
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
          <span className="text-sm font-medium truncate text-white/90">{name}</span>
          {lastMsg && (
            <span className="text-[10px] text-white/35 shrink-0 ml-2">
              {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-white/40 truncate">
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
