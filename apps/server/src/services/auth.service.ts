import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, users } from "db/src";
import { eq, and, gt } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { env } from "../lib/env";
import { sendPasswordResetEmail } from "../lib/email";
import { hashString } from "../lib/crypto";
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens } from "./token.service";

const toUserResponse = (user: typeof users.$inferSelect) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  isVerified: user.isVerified,
  lastSeenAt: user.lastSeenAt,
  createdAt: user.createdAt,
});

export const register = async (input: { name: string; email: string; password: string }) => {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) throw new AppError(409, "Email already in use", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [created] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash, role: "user" })
    .returning();

  if (!created) throw new AppError(500, "Failed to create user");
  const tokens = await issueTokenPair(created.id, created.role);
  return { user: toUserResponse(created), ...tokens };
};

export const login = async (input: { email: string; password: string }) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!user) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  if (!user.isActive) throw new AppError(403, "Account is deactivated", "ACCOUNT_DEACTIVATED");

  const tokens = await issueTokenPair(user.id, user.role);
  return { user: toUserResponse(user), ...tokens };
};

export const refresh = async (input: { refreshToken: string }) => {
  const result = await rotateRefreshToken(input.refreshToken);
  return result;
};

export const logout = async (userId: string, refreshToken: string) => {
  await revokeRefreshToken(refreshToken, userId);
};

export const forgotPassword = async (input: { email: string }) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  let userId: string | null = null;

  if (user && user.isActive) {
    userId = user.id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashString(resetToken);
    const expires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
    await db
      .update(users)
      .set({ passwordResetToken: tokenHash, passwordResetExpires: expires })
      .where(eq(users.id, user.id));
    await sendPasswordResetEmail(input.email, resetToken, user.name);
  }

  return { message: "If that email exists, we sent a reset link", userId };
};

export const resetPassword = async (input: { token: string; email: string; newPassword: string }) => {
  const tokenHash = hashString(input.token);
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.email, input.email),
      eq(users.passwordResetToken, tokenHash),
      gt(users.passwordResetExpires, new Date()),
    ),
  });

  if (!user) throw new AppError(400, "Invalid or expired token", "TOKEN_INVALID");

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, passwordResetToken: null, passwordResetExpires: null })
    .where(eq(users.id, user.id));

  await revokeAllUserTokens(user.id);
  return { message: "Password reset successfully", userId: user.id };
};
