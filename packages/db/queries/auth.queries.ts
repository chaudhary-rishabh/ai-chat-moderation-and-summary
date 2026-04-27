import { db, refreshTokens, auditLog } from "../src";
import { and, eq, isNull } from "drizzle-orm";
import type { NewRefreshToken, NewAuditLog } from "../schema";

export const insertRefreshToken = (data: NewRefreshToken) =>
  db.insert(refreshTokens).values(data).returning();

export const getRefreshToken = (hash: string) =>
  db.query.refreshTokens.findFirst({
    where: and(eq(refreshTokens.tokenHash, hash), isNull(refreshTokens.revokedAt)),
  });

export const revokeRefreshToken = (id: string) =>
  db.update(refreshTokens).set({ revokedAt: new Date() }).where(and(eq(refreshTokens.id, id), isNull(refreshTokens.revokedAt))).returning();

export const revokeAllUserTokens = (userId: string) =>
  db.update(refreshTokens).set({ revokedAt: new Date() }).where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));

export const insertAuditLog = (data: NewAuditLog) =>
  db.insert(auditLog).values(data).returning();
