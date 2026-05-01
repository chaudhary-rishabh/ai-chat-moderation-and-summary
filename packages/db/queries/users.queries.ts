import { db, users } from "../src";
import { eq } from "drizzle-orm";
import type { NewUser } from "../schema";

export const getUserById = (id: string) =>
  db.query.users.findFirst({ where: eq(users.id, id) });

export const getUserByEmail = (email: string) =>
  db.query.users.findFirst({ where: eq(users.email, email) });

export const createUser = (data: NewUser) =>
  db.insert(users).values(data).returning();

export const updateUser = (id: string, data: Partial<NewUser>) =>
  db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();

export const updateLastSeen = (id: string) =>
  db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, id));

export const setPasswordReset = (id: string, hash: string, expiry: Date) =>
  db.update(users).set({ passwordResetToken: hash, passwordResetExpires: expiry }).where(eq(users.id, id));

export const clearPasswordReset = (id: string) =>
  db.update(users).set({ passwordResetToken: null, passwordResetExpires: null }).where(eq(users.id, id));

export const deactivateUser = (id: string) =>
  db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, id));

export const resetUserPassword = (id: string, passwordHash: string) =>
  db
    .update(users)
    .set({ passwordHash, passwordResetToken: null, passwordResetExpires: null, updatedAt: new Date() })
    .where(eq(users.id, id));
