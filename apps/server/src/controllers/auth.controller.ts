import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service";
import { auditLog } from "../middleware/audit";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    req.user = { userId: result.user.id, role: result.user.role, jti: "" };
    auditLog("register")(req, res, () => {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    req.user = { userId: result.user.id, role: result.user.role, jti: "" };
    auditLog("login")(req, res, () => {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.refresh(req.body);
    req.user = { userId: result.userId, role: result.role, jti: "" };
    auditLog("token_refresh")(req, res, () => {});
    res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logout(req.user!.userId, req.body.refreshToken);
    auditLog("logout")(req, res, () => {});
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.forgotPassword(req.body);
    if (result.userId) {
      req.user = { userId: result.userId, role: "user", jti: "" };
    }
    auditLog("password_reset_request")(req, res, () => {});
    res.json({ message: result.message });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.resetPassword(req.body);
    req.user = { userId: result.userId, role: "user", jti: "" };
    auditLog("password_reset_complete")(req, res, () => {});
    res.json({ message: result.message });
  } catch (error) {
    next(error);
  }
};
