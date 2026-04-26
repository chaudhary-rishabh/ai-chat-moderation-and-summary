import type { ErrorRequestHandler } from "express";
import type { ZodIssue } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: ZodIssue[];

  constructor(statusCode: number, message: string, code?: string, details?: ZodIssue[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
};
