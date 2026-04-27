import { db, refreshTokens, users } from "db/src";
import { and, eq, gt, isNull } from "drizzle-orm";
import { hashString } from "../lib/crypto";
import { buildJwtPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { AppError, UnauthorizedError } from "../lib/errors";
import { getRefreshToken, insertRefreshToken } from "db/queries";

export const issueTokenPair = async (userId: string, role: string, ip?: string, userAgent?: string) => {
  const payload = buildJwtPayload(userId, role as any);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshHash = hashString(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await insertRefreshToken({
    userId,
    tokenHash: refreshHash,
    jti: payload.jti,
    expiresAt,
    ipAddress: ip ?? null,
    userAgent: userAgent ?? null,
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string, ip?: string, userAgent?: string) => {
  const decoded = verifyRefreshToken(oldToken);
  const hash = hashString(oldToken);

  const tokenRow = await getRefreshToken(hash);

  if (!tokenRow || tokenRow.userId !== decoded.userId || tokenRow.expiresAt < new Date()) {
    throw new UnauthorizedError("Invalid or expired refresh token", "REFRESH_INVALID");
  }

  const [revoked] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, tokenRow.id), isNull(refreshTokens.revokedAt)))
    .returning();

  if (!revoked) {
    throw new UnauthorizedError("Invalid or expired refresh token", "REFRESH_INVALID");
  }

  const tokens = await issueTokenPair(decoded.userId, decoded.role, ip, userAgent);
  return { ...tokens, userId: decoded.userId, role: decoded.role };
};

export const revokeRefreshToken = async (token: string, userId: string) => {
  const hash = hashString(token);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.tokenHash, hash), eq(refreshTokens.userId, userId)));
};

export const revokeAllForUser = async (userId: string) => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
};
