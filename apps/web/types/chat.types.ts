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
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
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
  members: RoomMember[];
  messages?: Array<{ content: string; createdAt: string; senderId: string }>;
  unreadCount?: number;
}

export interface RoomMember {
  id: string;
  role: "member" | "moderator" | "admin";
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    lastSeenAt: string | null;
  };
}

export interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  caption: string | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface AISuggestion {
  id: string;
  message: string;
  confidence: number;
}
