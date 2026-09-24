import { apiClient } from "../apiClient";
import type { Group, PaginationQuery, Paginated } from "../types";

export type GroupDetails = Group & {
    maxStudent: number;
    startDate: string;

    course?: {
        id: number;
        name: string;
        durationMonth?: number;
        durationHours?: number;
    };

    schedules?: Array<{
        weekDay: string;
        startTime: string;
        endTime: string;
        room?: {
            id: number;
            name: string;
        };
    }>;

    groupTeachers?: Array<{
        teacher: {
            user: {
                id: number;
                firstName: string;
                lastName: string;
            };
        };
    }>;

    studentGroups?: Array<{
        id: number;
        student: {
            user: {
                id: number;
                firstName: string;
                lastName: string;
                phone: string;
            };
        };
    }>;
};

export type CreateGroupInput = {
    name: string;
    courseId: string;
    teacherId?: string;
    studentIds?: string[];
    startDate: string;
    maxStudent: number;

    schedules: Array<{
        weekDay: string;
        startTime: string;
        endTime: string;
        roomId?: string;
    }>;
};

export type GroupStatus =
    | "PLANNED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";

export const groupsApi = {
    list(query: PaginationQuery = {}) {
        return apiClient.request<Paginated<Group>>(
            `/groups${apiClient.buildQuery(query)}`,
        );
    },

    get(id: number) {
        return apiClient.request<GroupDetails>(`/groups/${id}`);
    },

    create(input: CreateGroupInput) {
        return apiClient.request<Group>("/groups", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    update(
        id: number,
        data: Partial<{
            name: string;
            maxStudent: number;
            teacherId: string;
        }>,
    ) {
        return apiClient.request<Group>(`/groups/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    // ✅ GURUH STATUSINI O'ZGARTIRISH
    changeStatus(id: number, status: GroupStatus) {
        return apiClient.request<Group>(`/groups/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({
                status,
            }),
        });
    },

    remove(id: number) {
        return apiClient.request<void>(`/groups/${id}`, {
            method: "DELETE",
        });
    },
};