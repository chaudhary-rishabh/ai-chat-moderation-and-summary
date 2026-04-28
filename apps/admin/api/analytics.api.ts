import { apiClient } from "./client";
import type { AnalyticsData } from "@/types/analytics.types";

export const analyticsApi = {
  get: () => apiClient.get<AnalyticsData>("/analytics").then((r) => r.data),
};
