import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ZodError } from "zod";
import { ExpressError } from "../lib/errors";

export const validateBody =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ExpressError(400, "Validation failed", "VALIDATION_ERROR", error.issues));
        return;
      }
      next(error);
    }
  };

export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ExpressError(400, "Validation failed", "VALIDATION_ERROR", error.issues));
        return;
      }
      next(error);
    }
  };
