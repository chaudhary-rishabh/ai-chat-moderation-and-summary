import type { NextFunction, Request, Response } from "express";
import * as messagesService from "../services/messages.service";

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await messagesService.deleteMessageService(req.params.messageId as string, req.user!.userId, req.user!.role);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await messagesService.searchMessagesService(
      req.params.roomId as string,
      req.user!.userId,
      req.query.q as string,
    );
    res.json(results);
  } catch (error) {
    next(error);
  }
};
