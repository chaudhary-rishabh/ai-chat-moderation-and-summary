import type { WebSocket } from "ws";
import { ReactionAddPayload, ReactionRemovePayload } from "types/src/ws-events";
import * as reactionsService from "../../services/reactions.service";
import { logger } from "../../lib/logger";
import { roomManager } from "../roomManager";

export const handleReactionAdd = async (ws: WebSocket, rawPayload: unknown): Promise<void> => {
  const parsed = ReactionAddPayload.safeParse(rawPayload);
  if (!parsed.success) {
    ws.send(JSON.stringify({ type: "error", payload: { code: "VALIDATION_ERROR", message: "Invalid reaction payload", details: parsed.error.issues } }));
    return;
  }

  const { roomId, messageId, emoji } = parsed.data;
  const userId = (ws as any).userId as string;

  try {
    const reactions = await reactionsService.addReaction(messageId, userId, emoji, roomId);
    roomManager.broadcast(roomId, {
      type: "reaction:update",
      payload: {
        messageId,
        roomId,
        reactions: reactions.map((r) => ({ emoji: r.emoji, userId: r.userId, userName: r.user.name })),
      },
    });
  } catch (err: any) {
    logger.error({ err, userId, roomId }, "ws_reaction_add_error");
    ws.send(JSON.stringify({ type: "error", payload: { code: err.code ?? "INTERNAL_ERROR", message: err.message } }));
  }
};

export const handleReactionRemove = async (ws: WebSocket, rawPayload: unknown): Promise<void> => {
  const parsed = ReactionRemovePayload.safeParse(rawPayload);
  if (!parsed.success) {
    ws.send(JSON.stringify({ type: "error", payload: { code: "VALIDATION_ERROR", message: "Invalid reaction payload", details: parsed.error.issues } }));
    return;
  }

  const { roomId, messageId, emoji } = parsed.data;
  const userId = (ws as any).userId as string;

  try {
    const reactions = await reactionsService.removeReaction(messageId, userId, emoji, roomId);
    roomManager.broadcast(roomId, {
      type: "reaction:update",
      payload: {
        messageId,
        roomId,
        reactions: reactions.map((r) => ({ emoji: r.emoji, userId: r.userId, userName: r.user.name })),
      },
    });
  } catch (err: any) {
    logger.error({ err, userId, roomId }, "ws_reaction_remove_error");
    ws.send(JSON.stringify({ type: "error", payload: { code: err.code ?? "INTERNAL_ERROR", message: err.message } }));
  }
};
