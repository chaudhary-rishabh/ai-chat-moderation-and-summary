import { db, refreshTokens } from "db/src";
import { and, eq, gt, isNull } from "drizzle-orm";
import { hashString } from "../lib/crypto";
import { buildJwtPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { AppError } from "../lib/errors";

export const issueTokenPair = async (userId: string, role: "user" | "moderator" | "admin" | "superadmin") => {
  const payload = buildJwtPayload(userId, role);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshHash = hashString(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: refreshHash,
    jti: payload.jti,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string) => {
  const decoded = verifyRefreshToken(oldToken);
  const hash = hashString(oldToken);

  const tokenRow = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, hash),
      isNull(refreshTokens.revokedAt),
      gt(refreshTokens.expiresAt, new Date()),
    ),
  });

  if (!tokenRow || tokenRow.userId !== decoded.userId) {
    throw new AppError(401, "Invalid or expired refresh token", "REFRESH_INVALID");
  }

  const [revoked] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, tokenRow.id), isNull(refreshTokens.revokedAt)))
    .returning();

  if (!revoked) {
    throw new AppError(401, "Invalid or expired refresh token", "REFRESH_INVALID");
  }

  const tokens = await issueTokenPair(decoded.userId, decoded.role);
  return { ...tokens, userId: decoded.userId, role: decoded.role };
};

export const revokeRefreshToken = async (token: string, userId: string) => {
  const hash = hashString(token);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.tokenHash, hash), eq(refreshTokens.userId, userId)));
};

export const revokeAllUserTokens = async (userId: string) => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.userId, userId));
};
