import { apiClient } from "../apiClient";
import type { PaginationQuery, Paginated, User } from "../types";

export type CreateAdminInput = {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
};

export type CreatedAdmin = {
    user?: User;
    credentials?: { login: string; password: string };
};

export const adminsApi = {
    list(query: PaginationQuery = {}) {
        const q = { ...query, role: "ADMIN" } as PaginationQuery;
        return apiClient.request<Paginated<User>>
            ("/users" + apiClient.buildQuery(q));
    },
    get(id: number) {
        return apiClient.request<User>("/users/" + id);
    },
    update(id: number, data: Partial<CreateAdminInput> & { photo?: string }) {
        return apiClient.request<User>("/users/" + id, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    create(input: CreateAdminInput) {
        return apiClient.request<CreatedAdmin>("/users", {
            method: "POST",
            body: JSON.stringify({ ...input, role: "ADMIN" }),
        });
    },
    setStatus(id: number, status: string) {
        return apiClient.request<User>("/users/" + id + "/status", {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    },
    remove(id: number) {
        return apiClient.request<void>("/users/" + id, { method: "DELETE" });
    },
    restore(id: number) {
        return apiClient.request<User>("/users/" + id + "/restore", { method: "PATCH" });
    },
};
