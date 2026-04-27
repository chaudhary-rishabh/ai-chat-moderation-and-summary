import type { NextFunction, Request, Response } from "express";
import * as roomsService from "../services/rooms.service";
import * as messagesService from "../services/messages.service";

export const createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await roomsService.createRoomService(req.user!.userId, req.body);
    const status = result.isExisting ? 200 : 201;
    res.status(status).json(result.room);
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await roomsService.getRoomsForUserService(req.user!.userId);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const room = await roomsService.getRoomService(req.params.roomId as string, req.user!.userId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await roomsService.addMemberService(req.params.roomId as string, req.user!.userId, req.body.userId);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await roomsService.removeMemberService(req.params.roomId as string, req.user!.userId, req.params.userId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const result = await messagesService.getMessagesService(req.params.roomId as string, req.user!.userId, cursor, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await messagesService.markAsReadService(req.body.messageId, req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
