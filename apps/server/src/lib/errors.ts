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

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(401, message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(403, message, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code = "NOT_FOUND") {
    super(404, message, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(409, message, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: ZodIssue[]) {
    super(400, message, "VALIDATION_ERROR", details);
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
