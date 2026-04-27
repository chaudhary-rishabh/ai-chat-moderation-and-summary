import bcrypt from "bcryptjs";
import { db, users } from "db/src";
import { eq } from "drizzle-orm";
import { NotFoundError, UnauthorizedError } from "../lib/errors";
import { getUserById, updateUser, updateLastSeen as updateLastSeenQuery } from "db/queries";
import { revokeAllForUser } from "./token.service";

const toProfile = (user: typeof users.$inferSelect) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  isVerified: user.isVerified,
  lastSeenAt: user.lastSeenAt,
  createdAt: user.createdAt,
});

export const getProfile = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");
  return toProfile(user);
};

export const updateProfile = async (userId: string, data: { name?: string; avatarUrl?: string }) => {
  const [updated] = await updateUser(userId, data);
  if (!updated) throw new NotFoundError("User not found", "USER_NOT_FOUND");
  return toProfile(updated);
};

export const updateLastSeen = async (userId: string) => {
  await updateLastSeenQuery(userId);
};

export const changePassword = async (userId: string, currentPw: string, newPw: string) => {
  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");

  const valid = await bcrypt.compare(currentPw, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Current password is incorrect", "INVALID_CREDENTIALS");

  const passwordHash = await bcrypt.hash(newPw, 12);
  await updateUser(userId, { passwordHash } as any);
  await revokeAllForUser(userId);

  return { message: "Password updated" };
};
