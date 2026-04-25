import type { NextFunction, Request, Response } from "express";
import { ExpressError } from "../lib/errors";
import { verifyAccessToken } from "../lib/jwt";

export const verifyToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ExpressError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new ExpressError(401, "Unauthorized", "TOKEN_INVALID_OR_EXPIRED"));
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ExpressError(401, "Unauthorized", "UNAUTHORIZED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ExpressError(403, "Forbidden", "FORBIDDEN"));
    }
    return next();
  };
