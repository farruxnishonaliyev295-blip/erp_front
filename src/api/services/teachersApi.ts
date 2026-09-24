import { apiClient } from "../apiClient";
import type { Paginated, PaginationQuery, User } from "../types";

export type CreateTeacherInput = {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    password?: string;
    address?: string;
    photo?: string;
    /** Bir nechta guruh ID lari */
    groupIds?: string[];
};

export const teachersApi = {
    list(query: PaginationQuery = {}) {
        return apiClient.request<Paginated<User>>(
            `/teachers${apiClient.buildQuery(query)}`,
        );
    },
    get(id: number) {
        return apiClient.request<User>(`/teachers/${id}`);
    },
    create(input: CreateTeacherInput) {
        return apiClient.request<{ user: User }>("/teachers", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
    update(id: number, data: Partial<{ firstName: string; lastName: string; phone: string; email: string; address: string; photo: string; status: string }>) {
        return apiClient.request<User>(`/teachers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    remove(id: number) {
        return apiClient.request<void>(`/teachers/${id}`, { method: "DELETE" });
    },
    restore(id: number) {
        return apiClient.request(`/teachers/${id}/restore`, { method: "PATCH" });
    },
};
