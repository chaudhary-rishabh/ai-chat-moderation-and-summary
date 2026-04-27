import { ForbiddenError, NotFoundError } from "../lib/errors";
import { getMessagePage, getMessageById, softDeleteMessage, searchMessages, insertMessage, insertMessageRead } from "db/queries";
import { validateMembership } from "./rooms.service";

export const getMessagesService = async (roomId: string, userId: string, cursor?: string, limit = 50) => {
  await validateMembership(roomId, userId);
  const msgs = await getMessagePage(roomId, cursor, limit);

  const hasMore = msgs.length > limit;
  const items = hasMore ? msgs.slice(0, limit) : msgs;

  return {
    messages: items,
    nextCursor: hasMore ? items[items.length - 1]?.createdAt.toISOString() ?? null : null,
  };
};

export const sendMessageService = async (data: { roomId: string; senderId: string; type?: string; content?: string; mediaUrl?: string; threadParentId?: string }) => {
  await validateMembership(data.roomId, data.senderId);
  const [msg] = await insertMessage({
    roomId: data.roomId,
    senderId: data.senderId,
    type: (data.type as any) ?? "text",
    content: data.content ?? null,
    mediaUrl: data.mediaUrl ?? null,
    threadParentId: data.threadParentId ?? null,
  });
  if (!msg) throw new Error("Failed to send message");

  const full = await getMessageById(msg.id);
  return full;
};

export const deleteMessageService = async (messageId: string, requesterId: string, role: string) => {
  const msg = await getMessageById(messageId);
  if (!msg) throw new NotFoundError("Message not found", "MESSAGE_NOT_FOUND");

  if (msg.sender.id !== requesterId && role !== "admin" && role !== "superadmin") {
    throw new ForbiddenError("Cannot delete this message", "NOT_AUTHORIZED");
  }

  return softDeleteMessage(messageId);
};

export const searchMessagesService = async (roomId: string, userId: string, query: string) => {
  await validateMembership(roomId, userId);
  if (!query || query.length < 2) return [];
  return searchMessages(roomId, query);
};

export const markAsReadService = async (messageId: string, userId: string) => {
  return insertMessageRead(messageId, userId);
};
