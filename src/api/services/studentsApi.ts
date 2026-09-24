import { apiClient } from "../apiClient";
import type { PaginationQuery, Paginated, User } from "../types";

export type CreateStudentInput = {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    birthDate?: string;
    parentPhone?: string;
    address?: string;
    photo?: string;
    /** Bir nechta guruh ID lari */
    groupIds?: string[];
    password?: string;
};

export type UpdateStudentInput = Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    status: string;
    photo: string;
    birthDate: string;
    parentPhone: string;
}>;

export type CreatedStudent = {
    user: User;
    credentials: { login: string; password: string };
};

export const studentsApi = {
    my() {
        return apiClient.request("/students/my");
    },
    list(query: PaginationQuery = {}) {
        return apiClient.request<Paginated<User>>(
            `/students${apiClient.buildQuery(query)}`,
        );
    },
    get(id: number) {
        return apiClient.request<User>(`/students/${id}`);
    },
    create(input: CreateStudentInput) {
        return apiClient.request<CreatedStudent>("/students", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },
    update(id: number, data: UpdateStudentInput) {
        return apiClient.request<User>(`/students/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    remove(id: number) {
        return apiClient.request<void>(`/students/${id}`, { method: "DELETE" });
    },
    restore(id: number) {
        return apiClient.request(`/students/${id}/restore`, {
            method: "PATCH",
        });
    },
    addToGroup(studentId: number, groupId: number) {
        return apiClient.request(`/students/${studentId}/groups/${groupId}`, {
            method: "POST",
        });
    },
};
