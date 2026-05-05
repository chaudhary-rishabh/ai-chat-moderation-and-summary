"use client";

import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { usePresence } from "@/hooks/usePresence";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  PanelLeft,
  Hash,
  Users,
  MessageSquare,
  Phone,
  Video,
  Info,
  Wifi,
  WifiOff,
  Sparkles,
  Compass,
} from "lucide-react";
import { cn } from "@/utils/cn";

export function ChatHeader() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const typingUsersRaw = useChatStore((s) => s.typingUsers);
  const typingUsers = typingUsersRaw.filter((t) => t.roomId === activeRoomId && t.isTyping);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const panelMode = useUIStore((s) => s.panelMode);
  const setPanelMode = useUIStore((s) => s.setPanelMode);
  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const { status: wsStatus } = useWebSocket();
  const { isOnline } = usePresence();

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  if (!activeRoom) {
    return (
      <header className="px-5 py-3 border-b border-white/8 flex items-center gap-3 shrink-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <PanelLeft className="w-4 h-4 text-ink-soft" />
          </button>
        )}
        <span className="text-sm text-ink-faint">No conversation selected</span>
      </header>
    );
  }

  const roomName =
    activeRoom.name ??
    activeRoom.members.map((m) => m.user.name).join(", ");
  const isDm = activeRoom.type === "dm";
  const roomOnline = isDm && activeRoom.members.some((m) => isOnline(m.userId));

  return (
    <header className="px-5 py-3 border-b border-white/8 flex items-center gap-3 shrink-0">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
        >
          <PanelLeft className="w-4 h-4 text-ink-soft" />
        </button>
      )}

      <div className="w-9 h-9 rounded-xl glass-soft flex items-center justify-center shrink-0">
        {activeRoom.avatarUrl ? (
          <img
            src={activeRoom.avatarUrl}
            alt=""
            className="w-9 h-9 rounded-xl object-cover"
          />
        ) : activeRoom.type === "dm" ? (
          <MessageSquare className="w-4 h-4 text-ink-soft" />
        ) : activeRoom.type === "channel" ? (
          <Hash className="w-4 h-4 text-ink-soft" />
        ) : (
          <Users className="w-4 h-4 text-ink-soft" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-ink truncate">{roomName}</h2>
        <p className="text-[11px] text-ink-faint">
          {typingUsers.length > 0
            ? typingUsers.map((t) => t.userName).join(", ") + " typing..."
            : isDm
              ? roomOnline
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
        <button
          onClick={() => setPanelMode(panelMode === "ai" ? "chat" : "ai")}
          className={cn(
            "p-1.5 rounded-lg transition",
            panelMode === "ai"
              ? "bg-ai-accent/20 text-ai-accent"
              : "hover:bg-white/10 text-ink-soft",
          )}
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            setPanelMode(panelMode === "summary" ? "chat" : "summary")
          }
          className={cn(
            "p-1.5 rounded-lg transition",
            panelMode === "summary"
              ? "bg-summary-accent/20 text-summary-accent"
              : "hover:bg-white/10 text-ink-soft",
          )}
          title="Summary"
        >
          <Compass className="w-4 h-4" />
        </button>
        {isDm && (
          <>
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
              <Phone className="w-4 h-4 text-ink-soft" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
              <Video className="w-4 h-4 text-ink-soft" />
            </button>
          </>
        )}
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
          <Info className="w-4 h-4 text-ink-soft" />
        </button>
      </div>
    </header>
  );
}
