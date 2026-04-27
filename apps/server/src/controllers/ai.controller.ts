import type { Request, Response, NextFunction } from "express";
import { aiService } from "../services/ai.service";
import { SuggestPayload } from "types/src/ai";
import { logger } from "../lib/logger";

export const aiController = {
  summarize: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = req.params.roomId as string;
      const language = (req.query.lang as string) ?? "en";
      const userId = (req as any).user?.userId as string;

      const summary = await aiService.getSummary(roomId, userId, language);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },

  suggest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId, content, history } = SuggestPayload.parse(req.body);
      const userId = (req as any).user?.userId as string;

      const suggestions = await aiService.getSuggestions(roomId, userId, content, history);
      res.json({ suggestions });
    } catch (err) {
      next(err);
    }
  },

  chat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId } = req.body as { message: string; sessionId?: string };
      const userId = (req as any).user?.userId as string;

      if (!message?.trim()) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const result = await aiService.processDirectChat(userId, message, sessionId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  chatStream: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId } = req.query as { message?: string; sessionId?: string };
      const userId = (req as any).user?.userId as string;

      if (!message?.trim()) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      // SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      await aiService.streamDirectChatResponse(userId, message, sessionId, res);
    } catch (err) {
      logger.error({ err }, "chat_stream_error");
      if (!res.headersSent) {
        next(err);
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  },

  getChatSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId as string;
      const { getOrCreateSession, getSessionMessages } = await import("db/queries");

      const session = await getOrCreateSession(userId);
      const data = await getSessionMessages(session.id);

      res.json({
        sessionId: session.id,
        messages: data?.messages ?? [],
        tokenCount: session.tokenCount,
      });
    } catch (err) {
      next(err);
    }
  },
};
