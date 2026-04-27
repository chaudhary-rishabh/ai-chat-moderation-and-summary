import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: { id: string; name: string; avatarUrl: string | null };
  type: string;
  content: string | null;
  mediaUrl: string | null;
  threadParentId: string | null;
  createdAt: string;
  isDeleted?: boolean;
  isFlagged?: boolean;
}

export interface ChatRoom {
  id: string;
  type: "dm" | "group" | "channel";
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  createdBy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    userId: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null; role: string; lastSeenAt: string | null };
  }>;
  messages?: Array<{ content: string; createdAt: string; senderId: string }>;
  unreadCount?: number;
}

interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: TypingUser[];
  onlineUsers: Set<string>;
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  prependMessages: (roomId: string, messages: ChatMessage[]) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  setTyping: (roomId: string, userId: string, userName: string, isTyping: boolean) => void;
  setOnline: (userId: string, online: boolean) => void;
  getTypingUsers: (roomId: string) => TypingUser[];
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    typingUsers: [],
    onlineUsers: new Set<string>(),

    setRooms: (rooms) => set((s) => { s.rooms = rooms; }),

    setActiveRoom: (roomId) => set((s) => { s.activeRoomId = roomId; }),

    addMessage: (roomId, message) =>
      set((s) => {
        if (!s.messages[roomId]) s.messages[roomId] = [];
        // Avoid duplicates
        const exists = s.messages[roomId].some((m) => m.id === message.id);
        if (!exists) s.messages[roomId].push(message);
      }),

    setMessages: (roomId, messages) =>
      set((s) => {
        s.messages[roomId] = messages;
      }),

    prependMessages: (roomId, messages) =>
      set((s) => {
        if (!s.messages[roomId]) s.messages[roomId] = [];
        const existingIds = new Set(s.messages[roomId].map((m) => m.id));
        const newMsgs = messages.filter((m) => !existingIds.has(m.id));
        s.messages[roomId] = [...newMsgs, ...s.messages[roomId]];
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
          const exists = s.typingUsers.find((t) => t.userId === userId && t.roomId === roomId);
          if (!exists) s.typingUsers.push({ userId, userName, roomId, isTyping });
        } else {
          s.typingUsers = s.typingUsers.filter(
            (t) => !(t.userId === userId && t.roomId === roomId),
          );
        }
      }),

    setOnline: (userId, online) =>
      set((s) => {
        if (online) s.onlineUsers.add(userId);
        else s.onlineUsers.delete(userId);
      }),

    getTypingUsers: (roomId) => get().typingUsers.filter((t) => t.roomId === roomId && t.isTyping),
  })),
);
