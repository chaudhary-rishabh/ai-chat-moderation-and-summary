import { z } from "zod";

// ─── Client → Server events ────────────────────────────────────────────────────

export const MsgSendPayload = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(["text", "image", "video", "audio", "file"]).default("text"),
  mediaUrl: z.string().url().optional(),
  threadParentId: z.string().uuid().optional(),
});
export type MsgSendPayload = z.infer<typeof MsgSendPayload>;

export const TypingStartPayload = z.object({
  roomId: z.string().uuid(),
});
export type TypingStartPayload = z.infer<typeof TypingStartPayload>;

export const TypingStopPayload = z.object({
  roomId: z.string().uuid(),
});
export type TypingStopPayload = z.infer<typeof TypingStopPayload>;

export const ReactionAddPayload = z.object({
  roomId: z.string().uuid(),
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});
export type ReactionAddPayload = z.infer<typeof ReactionAddPayload>;

export const ReactionRemovePayload = z.object({
  roomId: z.string().uuid(),
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});
export type ReactionRemovePayload = z.infer<typeof ReactionRemovePayload>;

export const PresencePingPayload = z.object({});
export type PresencePingPayload = z.infer<typeof PresencePingPayload>;

export type ClientToServerEvent =
  | { type: "msg:send"; payload: MsgSendPayload }
  | { type: "typing:start"; payload: TypingStartPayload }
  | { type: "typing:stop"; payload: TypingStopPayload }
  | { type: "reaction:add"; payload: ReactionAddPayload }
  | { type: "reaction:remove"; payload: ReactionRemovePayload }
  | { type: "presence:ping"; payload: PresencePingPayload };

// ─── Server → Client events ────────────────────────────────────────────────────

export interface MsgNewPayload {
  message: {
    id: string;
    roomId: string;
    sender: { id: string; name: string; avatarUrl: string | null };
    type: string;
    content: string | null;
    mediaUrl: string | null;
    threadParentId: string | null;
    createdAt: string;
  };
}

export interface MsgDeletedPayload {
  messageId: string;
  roomId: string;
}

export interface MsgFlaggedPayload {
  messageId: string;
  roomId: string;
  flagType: string;
}

export interface TypingUpdatePayload {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface PresenceUpdatePayload {
  userId: string;
  status: "online" | "offline";
  lastSeenAt?: string;
}

export interface ReactionUpdatePayload {
  messageId: string;
  roomId: string;
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

export interface SafetyAlertPayload {
  messageId: string;
  roomId: string;
  senderId: string;
  flagType: string;
  confidenceScore: number;
  offendingSpan: string | null;
}

export type ServerToClientEvent =
  | { type: "msg:new"; payload: MsgNewPayload }
  | { type: "msg:deleted"; payload: MsgDeletedPayload }
  | { type: "msg:flagged"; payload: MsgFlaggedPayload }
  | { type: "typing:update"; payload: TypingUpdatePayload }
  | { type: "presence:update"; payload: PresenceUpdatePayload }
  | { type: "reaction:update"; payload: ReactionUpdatePayload }
  | { type: "safety:alert"; payload: SafetyAlertPayload };

// ─── Handler type ──────────────────────────────────────────────────────────────

export type WsEventHandler<T> = (payload: T) => void;
