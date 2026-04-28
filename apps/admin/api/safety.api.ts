import { apiClient } from "./client";
import type { AdminSafetyFlag, PaginatedResponse } from "@/types/admin.types";

export const safetyApi = {
  flags: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<AdminSafetyFlag>>("/safety/flags", { params }).then((r) => r.data),

  review: (flagId: string, status: string) =>
    apiClient.put<{ success: boolean }>(`/safety/flags/${flagId}/review`, { status }).then((r) => r.data),
};
