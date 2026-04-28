export type UserRole = "user" | "moderator" | "admin" | "superadmin";
export type FlagType = "abuse" | "bullying" | "harassment" | "hate_speech" | "spam" | "self_harm" | "other";
export type FlagStatus = "pending" | "reviewed_safe" | "reviewed_removed" | "auto_blocked";
export type RoomType = "dm" | "group" | "channel";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  rooms: { id: string; name: string | null; type: RoomType; isArchived: boolean; createdAt: string }[];
  safetyFlags: { id: string; flagType: FlagType; status: FlagStatus; confidenceScore: number; createdAt: string }[];
  auditLogs: { id: string; event: string; ipAddress: string | null; createdAt: string }[];
}

export interface AdminRoom {
  id: string;
  type: RoomType;
  name: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  memberCount: number;
}

export interface AdminRoomDetail {
  room: AdminRoom;
  members: { id: string; name: string; email: string; role: string; joinedAt: string }[];
  recentMessages: {
    id: string;
    content: string | null;
    type: string;
    senderId: string;
    senderName: string;
    isDeleted: boolean;
    isFlagged: boolean;
    createdAt: string;
  }[];
}

export interface AdminSafetyFlag {
  id: string;
  messageId: string;
  flaggedBy: string | null;
  flagType: FlagType;
  confidenceScore: number;
  reasoning: string | null;
  offendingSpan: string | null;
  status: FlagStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  messageContent: string | null;
  senderName: string | null;
}

export interface AdminStory {
  id: string;
  userId: string;
  mediaType: "image" | "video" | "text";
  mediaUrl: string | null;
  caption: string | null;
  bgColor: string | null;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  userName: string;
}

export interface AdminAuditLog {
  id: string;
  userId: string | null;
  event: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
  userName: string | null;
}

export interface PaginatedResponse<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
}
