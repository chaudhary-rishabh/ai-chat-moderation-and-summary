import type { WebSocket } from "ws";
import { MsgSendPayload } from "types/src/ws-events";
import { sendMessageService } from "../../services/messages.service";
import { upsertThread, incrementReplyCount } from "db/queries";
import { logger } from "../../lib/logger";
import { roomManager } from "../roomManager";

export const handleMsgSend = async (ws: WebSocket, rawPayload: unknown): Promise<void> => {
  const parsed = MsgSendPayload.safeParse(rawPayload);
  if (!parsed.success) {
    ws.send(JSON.stringify({ type: "error", payload: { code: "VALIDATION_ERROR", message: "Invalid message payload", details: parsed.error.issues } }));
    return;
  }

  const { roomId, content, type, mediaUrl, threadParentId } = parsed.data;
  const userId = (ws as any).userId as string;
  const userName = roomManager.getUserInfo(userId)?.name ?? "Unknown";

  try {
    const message = await sendMessageService({
      roomId,
      senderId: userId,
      type,
      content,
      mediaUrl,
      threadParentId,
    });

    if (threadParentId) {
      await upsertThread(threadParentId, roomId);
      await incrementReplyCount(threadParentId);
    }

    roomManager.broadcast(roomId, {
      type: "msg:new",
      payload: {
        message: {
          id: message!.id,
          roomId,
          sender: { id: userId, name: userName, avatarUrl: roomManager.getUserInfo(userId)?.avatarUrl ?? null },
          type: type ?? "text",
          content: content ?? null,
          mediaUrl: mediaUrl ?? null,
          threadParentId: threadParentId ?? null,
          createdAt: message!.createdAt.toISOString(),
        },
      },
    });

    // Fire-and-forget: enqueue embed and safety jobs
    // These are imported lazily to avoid circular deps
    try {
      const { getQueue } = require("../../jobs/queue");
      const embedQueue = getQueue("embed");
      const safetyQueue = getQueue("safety");
      if (embedQueue) void embedQueue.add("embed", { messageId: message!.id, content: content ?? "" });
      if (safetyQueue) void safetyQueue.add("safety", { messageId: message!.id, content: content ?? "", roomId, senderId: userId });
    } catch {
      // Queues not initialized yet — OK in dev
    }
  } catch (err: any) {
    logger.error({ err, userId, roomId }, "ws_msg_send_error");
    ws.send(JSON.stringify({ type: "error", payload: { code: err.code ?? "INTERNAL_ERROR", message: err.message } }));
  }
};
