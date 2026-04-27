import type { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users.service";

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await usersService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await usersService.updateProfile(req.user!.userId, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await usersService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateLastSeen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await usersService.updateLastSeen(req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
