import { apiClient } from "./client";
import type { AdminUser, AdminUserDetail, PaginatedResponse } from "@/types/admin.types";

export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/users", { params }).then((r) => r.data),

  detail: (userId: string) =>
    apiClient.get<AdminUserDetail>(`/users/${userId}`).then((r) => r.data),

  deactivate: (userId: string) =>
    apiClient.put<{ success: boolean }>(`/users/${userId}/deactivate`).then((r) => r.data),

  changeRole: (userId: string, role: string) =>
    apiClient.put<{ success: boolean }>(`/users/${userId}/role`, { role }).then((r) => r.data),

  resetPassword: (userId: string) =>
    apiClient.post<{ resetToken: string; expiresIn: number }>(`/users/${userId}/reset-password`).then((r) => r.data),
};
