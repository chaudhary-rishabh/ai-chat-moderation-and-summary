import { z } from "zod";

export const RoleSchema = z.enum(["user", "moderator", "admin", "superadmin"]);

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().trim().email(),
  newPassword: PasswordSchema,
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().trim().url().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: PasswordSchema,
});

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  avatarUrl: z.string().url().nullable(),
  isVerified: z.boolean(),
  lastSeenAt: z.date().nullable(),
  createdAt: z.date(),
});

export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  role: RoleSchema,
  jti: z.string().uuid(),
});

export const AuthResponseSchema = z.object({
  user: UserPublicSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type UserRole = z.infer<typeof RoleSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
