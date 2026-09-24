import { apiClient } from "../apiClient";
import type { Paginated, PaginationQuery } from "../types";

export interface Course {
    id: number;
    name: string;
    description?: string | null;
    price: number | string;
    durationMonth: number;
    durationHours: number;
    status: "ACTIVE" | "INACTIVE";
    _count?: { groups: number };
}

export type CreateCourseInput = {
    name: string;
    description?: string;
    price: number;
    durationMonth: number;
    durationHours: number;
};

export type UpdateCourseInput = Partial<CreateCourseInput> & { status?: "ACTIVE" | "INACTIVE" };

export const coursesApi = {
    list(query: PaginationQuery = {}) {
        return apiClient.request<Paginated<Course>>(
            `/courses${apiClient.buildQuery(query)}`,
        );
    },
    get(id: number) {
        return apiClient.request<Course>(`/courses/${id}`);
    },
    create(input: CreateCourseInput) {
        return apiClient.request<Course>("/courses", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
    update(id: number, input: UpdateCourseInput) {
        return apiClient.request<Course>(`/courses/${id}`, {
            method: "PATCH",
            body: JSON.stringify(input),
        });
    },
    remove(id: number) {
        return apiClient.request<void>(`/courses/${id}`, { method: "DELETE" });
    },
};
