import { apiClient } from "../apiClient";
import type { Lesson, Paginated, PaginationQuery } from "../types";

export const lessonsApi = {
    list(query: PaginationQuery & { groupId?: number; status?: string } = {}) {
        return apiClient.request<Paginated<Lesson>>(
            `/lessons${apiClient.buildQuery(query)}`,
        );
    },
    attendance(lessonId: number) {
        return apiClient.request(`/lessons/${lessonId}/attendance`);
    },
};
