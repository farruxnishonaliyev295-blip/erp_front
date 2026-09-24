import { apiClient } from "../apiClient";
import type { User } from "../types";

export interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
}

export const profileApi = {
    me() {
        return apiClient.me() as Promise<User>;
    },
    updateMe(input: UpdateProfileInput) {
        return apiClient.request<User>("/users/me/profile", {
            method: "PATCH",
            body: JSON.stringify(input),
        });
    },
    changePassword(oldPassword: string, newPassword: string) {
        return apiClient.changePassword(oldPassword, newPassword);
    },
    uploadPhoto(file: File) {
        return apiClient.uploadPhoto(file);
    },
};
