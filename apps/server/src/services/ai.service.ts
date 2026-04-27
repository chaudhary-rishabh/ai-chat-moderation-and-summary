import { summarizeRoom } from "../ai/summarize";
import { generateSuggestions } from "../ai/suggest";
import { handleDirectChat, streamDirectChat } from "../ai/directChat";
import type { Response } from "express";
import type { FormattedSummary } from "types/src/ai";

export const aiService = {
  getSummary: async (
    roomId: string,
    userId: string,
    language: string,
  ): Promise<FormattedSummary> => {
    return summarizeRoom(roomId, language, userId);
  },

  getSuggestions: async (
    roomId: string,
    userId: string,
    input: string,
    history?: Array<{ senderName: string; content: string }>,
  ): Promise<string[]> => {
    return generateSuggestions(roomId, input, history);
  },

  processDirectChat: async (
    userId: string,
    message: string,
    sessionId?: string,
  ) => {
    return handleDirectChat(userId, message, sessionId);
  },

  streamDirectChatResponse: async (
    userId: string,
    message: string,
    sessionId: string | undefined,
    res: Response,
  ): Promise<void> => {
    return streamDirectChat(userId, message, sessionId, res);
  },
};
