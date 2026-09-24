import { apiClient } from "../apiClient";

export const attendanceApi = {
    lesson(lessonId: number) {
        return apiClient.request(`/attendance/lesson/${lessonId}`);
    },
    mark(
        lessonId: number,
        items: Array<{ studentId: number; status: string; reason?: string }>,
    ) {
        return apiClient.request(`/attendance/lesson/${lessonId}`, {
            method: "POST",
            body: JSON.stringify({ items }),
        });
    },
    student(studentId: number) {
        return apiClient.request(`/attendance/student/${studentId}`);
    },
};
