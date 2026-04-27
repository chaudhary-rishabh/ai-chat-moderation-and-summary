import type { WebSocket } from "ws";
import { TypingStartPayload, TypingStopPayload } from "types/src/ws-events";
import { validateMembership } from "../../services/rooms.service";
import { logger } from "../../lib/logger";
import { roomManager } from "../roomManager";

export const handleTypingStart = async (ws: WebSocket, rawPayload: unknown): Promise<void> => {
  const parsed = TypingStartPayload.safeParse(rawPayload);
  if (!parsed.success) return;

  const { roomId } = parsed.data;
  const userId = (ws as any).userId as string;

  try {
    await validateMembership(roomId, userId);
    const userInfo = roomManager.getUserInfo(userId);
    roomManager.broadcast(roomId, {
      type: "typing:update",
      payload: { roomId, userId, userName: userInfo?.name ?? "Unknown", isTyping: true },
    }, userId);
  } catch (err) {
    logger.error({ err, userId, roomId }, "ws_typing_start_error");
  }
};

export const handleTypingStop = async (ws: WebSocket, rawPayload: unknown): Promise<void> => {
  const parsed = TypingStopPayload.safeParse(rawPayload);
  if (!parsed.success) return;

  const { roomId } = parsed.data;
  const userId = (ws as any).userId as string;

  try {
    await validateMembership(roomId, userId);
    const userInfo = roomManager.getUserInfo(userId);
    roomManager.broadcast(roomId, {
      type: "typing:update",
      payload: { roomId, userId, userName: userInfo?.name ?? "Unknown", isTyping: false },
    }, userId);
  } catch (err) {
    logger.error({ err, userId, roomId }, "ws_typing_stop_error");
  }
};
