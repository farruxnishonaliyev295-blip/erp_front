import { apiClient } from "../apiClient";
import type { Paginated, PaginationQuery } from "../types";

export type NotificationType = "PAYMENT" | "LESSON" | "HOMEWORK" | "EXAM" | "SYSTEM";

export interface AppNotification {
    id: number;
    type: NotificationType;
    title: string;
    body: string;
    readAt: string | null;
    createdAt: string;
}

export const notificationsApi = {
    list(query: PaginationQuery = {}) {
        return apiClient.request<Paginated<AppNotification>>(
            `/notifications${apiClient.buildQuery(query)}`,
        );
    },
    markRead(id: number) {
        return apiClient.request(`/notifications/${id}/read`, {
            method: "PATCH",
        });
    },
    markAllRead() {
        return apiClient.request("/notifications/read-all", { method: "POST" });
    },
};
