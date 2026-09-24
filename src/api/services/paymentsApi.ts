import { apiClient } from "../apiClient";
import type { Paginated, Payment, PaginationQuery } from "../types";

export const paymentsApi = {
    my() {
        return apiClient.request<{ items: Array<{ id: number; amount: number | string; method: string; status?: string; paidAt?: string | null }>; balance: number | string }>("/payments/my");
    },
    list(
        query: PaginationQuery & {
            studentId?: number;
            groupId?: number;
            method?: string;
        } = {},
    ) {
        return apiClient.request<Paginated<Payment> & { totalAmount: number | string }>(
            `/payments${apiClient.buildQuery(query)}`,
        );
    },
    studentBalance(studentId: number) {
        return apiClient.request(`/payments/students/${studentId}/balance`);
    },
};
