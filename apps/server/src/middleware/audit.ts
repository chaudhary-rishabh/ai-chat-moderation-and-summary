import { db } from "db/src";
import { auditLog as auditLogTable } from "db/src";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

type Metadata = Record<string, unknown>;

export const auditLog =
  (event: string, metadata?: Metadata) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const payload = {
      userId: req.user?.userId ?? null,
      event,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? null,
      timestamp: new Date().toISOString(),
      ...(metadata ?? {}),
    };

    logger.info(payload, "audit_event");

    void db
      .insert(auditLogTable)
      .values({
        userId: req.user?.userId ?? null,
        event,
        metadata: metadata ?? {},
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? null,
      })
      .catch((error: unknown) => {
        logger.error({ error, event }, "audit_log_insert_failed");
      });

    next();
  };
