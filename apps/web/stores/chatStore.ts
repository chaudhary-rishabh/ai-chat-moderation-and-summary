import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ChatMessage, ChatRoom, TypingUser } from "@/types/chat.types";

interface PresenceInfo {
  status: "online" | "offline";
  lastSeenAt?: string;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: TypingUser[];
  presence: Map<string, PresenceInfo>;
  threadParentId: string | null;

  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  prependMessages: (roomId: string, messages: ChatMessage[]) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  setTyping: (roomId: string, userId: string, userName: string, isTyping: boolean) => void;
  setPresence: (userId: string, info: PresenceInfo) => void;
  setThreadParent: (messageId: string | null) => void;
  getOnlineUsers: () => Set<string>;
  getTypingInRoom: (roomId: string) => TypingUser[];
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    typingUsers: [],
    presence: new Map(),
    threadParentId: null,

    setRooms: (rooms) =>
      set((s) => {
        s.rooms = rooms;
      }),

    setActiveRoom: (roomId) =>
      set((s) => {
        s.activeRoomId = roomId;
      }),

    addMessage: (roomId, message) =>
      set((s) => {
        const arr = s.messages[roomId];
        if (!arr) { s.messages[roomId] = [message]; return; }
        if (!arr.some((m) => m.id === message.id)) arr.push(message);
      }),

    setMessages: (roomId, messages) =>
      set((s) => {
        s.messages[roomId] = messages;
      }),

    prependMessages: (roomId, messages) =>
      set((s) => {
        const existing = s.messages[roomId];
        if (!existing) { s.messages[roomId] = messages; return; }
        const existingIds = new Set(existing.map((m) => m.id));
        const newMsgs = messages.filter((m) => !existingIds.has(m.id));
        s.messages[roomId] = [...newMsgs, ...existing];
      }),

    deleteMessage: (roomId, messageId) =>
      set((s) => {
        const msgs = s.messages[roomId];
        if (msgs) {
          const found = msgs.find((m) => m.id === messageId);
          if (found) found.isDeleted = true;
        }
      }),

    setTyping: (roomId, userId, userName, isTyping) =>
      set((s) => {
        if (isTyping) {
          const exists = s.typingUsers.find(
            (t) => t.userId === userId && t.roomId === roomId,
          );
          if (!exists) s.typingUsers.push({ userId, userName, roomId, isTyping });
        } else {
          s.typingUsers = s.typingUsers.filter(
            (t) => !(t.userId === userId && t.roomId === roomId),
          );
        }
      }),

    setPresence: (userId, info) =>
      set((s) => {
        (s.presence as Map<string, PresenceInfo>).set(userId, info);
      }),

    setThreadParent: (messageId) =>
      set((s) => {
        s.threadParentId = messageId;
      }),

    getOnlineUsers: () => {
      const online = new Set<string>();
      const p = get().presence;
      if (p) {
        p.forEach((info, userId) => {
          if (info.status === "online") online.add(userId);
        });
      }
      return online;
    },

    getTypingInRoom: (roomId) =>
      get().typingUsers.filter((t) => t.roomId === roomId && t.isTyping),
  })),
);
