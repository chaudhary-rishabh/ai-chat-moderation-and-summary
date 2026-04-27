import api from "./client";
import type { AuthResponse } from "@repo/types/auth";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/register", { name, email, password }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post("/api/auth/logout", { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, email: string, newPassword: string) =>
    api.post("/api/auth/reset-password", { token, email, newPassword }).then((r) => r.data),
};
