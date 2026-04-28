import { apiClient } from "./client";
import type { AdminAuditLog, PaginatedResponse } from "@/types/admin.types";

export const auditApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<AdminAuditLog>>("/audit-log", { params }).then((r) => r.data),
};
