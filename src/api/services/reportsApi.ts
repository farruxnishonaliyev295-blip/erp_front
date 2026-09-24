import { apiClient } from "../apiClient";
import type { DashboardReport } from "../types";

export const reportsApi = {
  dashboard() { return apiClient.request<DashboardReport>("/reports/dashboard"); },
  financial(query: Record<string, string | number | undefined> = {}) { return apiClient.request(`/reports/financial${apiClient.buildQuery(query)}`); },
  attendance(query: Record<string, string | number | undefined> = {}) { return apiClient.request(`/reports/attendance${apiClient.buildQuery(query)}`); },
  courses() { return apiClient.request("/reports/courses"); },
};
