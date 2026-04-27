import { validateMembership } from "./rooms.service";
import { upsertReaction, deleteReaction, getReactionsByMessage } from "db/queries";
import { NotFoundError } from "../lib/errors";

export const addReaction = async (messageId: string, userId: string, emoji: string, roomId: string) => {
  await validateMembership(roomId, userId);
  await upsertReaction(messageId, userId, emoji);
  return getReactionsByMessage(messageId);
};

export const removeReaction = async (messageId: string, userId: string, emoji: string, roomId: string) => {
  await validateMembership(roomId, userId);
  await deleteReaction(messageId, userId, emoji);
  return getReactionsByMessage(messageId);
};
