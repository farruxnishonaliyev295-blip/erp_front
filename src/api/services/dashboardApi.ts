import { apiClient } from "../apiClient";
export const dashboardApi = {
  student() { return apiClient.request("/dashboard/student"); },
  teacher() { return apiClient.request("/dashboard/teacher"); },
};
