import { apiClient } from "../apiClient";
import type { User } from "../types";

export const authApi = {
    login(identifier: string, password: string) {
        return apiClient.login(identifier, password);
    },
    me() {
        return apiClient.me() as Promise<User>;
    },
};
