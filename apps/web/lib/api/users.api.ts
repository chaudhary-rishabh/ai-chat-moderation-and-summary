import type { UserPublic } from "@repo/types/auth";
import api from "./client";

export const usersApi = {
  me: () => api.get<UserPublic>("/api/users/me").then((r) => r.data),

  update: (data: { name?: string; avatarUrl?: string }) =>
    api.patch<UserPublic>("/api/users/me", data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/api/users/me/password", { currentPassword, newPassword }).then((r) => r.data),

  getById: (userId: string) =>
    api.get<UserPublic>(`/api/users/${userId}`).then((r) => r.data),
};
