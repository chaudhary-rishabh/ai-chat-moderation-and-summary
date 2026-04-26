import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import type { UserRole } from "types/src";
import { env } from "./env";

export type AuthJwtPayload = {
  userId: string;
  role: UserRole;
  jti: string;
};

export const buildJwtPayload = (userId: string, role: UserRole): AuthJwtPayload => ({
  userId,
  role,
  jti: uuid(),
});

export const signAccessToken = (payload: AuthJwtPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions["expiresIn"],
  });

export const signRefreshToken = (payload: AuthJwtPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions["expiresIn"],
  });

export const verifyAccessToken = (token: string): AuthJwtPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthJwtPayload;

export const verifyRefreshToken = (token: string): AuthJwtPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthJwtPayload;
