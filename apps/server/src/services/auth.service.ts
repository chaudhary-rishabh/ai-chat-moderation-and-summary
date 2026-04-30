import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { users } from "db/src";
import { AppError, ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from "../lib/errors";
import { env } from "../lib/env";
import { sendPasswordResetEmail } from "../lib/email";
import { hashString } from "../lib/crypto";
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken, revokeAllForUser } from "./token.service";
import { getUserByEmail, createUser, setPasswordReset, resetUserPassword } from "db/queries";

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

export const register = async (input: { name: string; email: string; password: string }, ip?: string, userAgent?: string) => {
  const existing = await getUserByEmail(input.email);
  if (existing) throw new ConflictError("Email already in use", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [created] = await createUser({ name: input.name, email: input.email, passwordHash, role: "user" });

  if (!created) throw new AppError(500, "Failed to create user");
  const tokens = await issueTokenPair(created.id, created.role, ip, userAgent);
  return { user: toUserResponse(created), ...tokens };
};

export const login = async (input: { email: string; password: string }, ip?: string, userAgent?: string) => {
  const user = await getUserByEmail(input.email);
  if (!user) throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");

  if (!user.isActive) throw new ForbiddenError("Account is deactivated", "ACCOUNT_DEACTIVATED");

  const tokens = await issueTokenPair(user.id, user.role, ip, userAgent);
  return { user: toUserResponse(user), ...tokens };
};

export const refresh = async (refreshToken: string, ip?: string, userAgent?: string) => {
  return rotateRefreshToken(refreshToken, ip, userAgent);
};

export const logout = async (refreshToken: string, userId: string) => {
  await revokeRefreshToken(refreshToken, userId);
};

export const forgotPassword = async (email: string) => {
  const user = await getUserByEmail(email);
  let userId: string | null = null;

  if (user && user.isActive) {
    userId = user.id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashString(resetToken);
    const expires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
    await setPasswordReset(user.id, tokenHash, expires);
    await sendPasswordResetEmail(email, resetToken, user.name);
  }

  return { message: "If that email exists, we sent a reset link", userId };
};

export const resetPassword = async (input: { token: string; email: string; newPassword: string }) => {
  const tokenHash = hashString(input.token);
  const user = await getUserByEmail(input.email);

  if (
    !user ||
    !user.passwordResetToken ||
    !user.passwordResetExpires ||
    user.passwordResetToken !== tokenHash ||
    user.passwordResetExpires < new Date()
  ) {
    throw new UnauthorizedError("Invalid or expired token", "TOKEN_INVALID");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await resetUserPassword(user.id, passwordHash);

  await revokeAllForUser(user.id);
  return { message: "Password reset successfully", userId: user.id };
};
