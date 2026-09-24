export type Role = "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    photo?: string | null;
    role: Role;
    status: string;
    studentProfile?: unknown;
    teacherProfile?: unknown;
}

export interface AuthResponse {
    user: User;
    mustChangePassword: boolean;
    tokens: { accessToken: string; refreshToken: string };
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    archived?: boolean;
}

export interface Paginated<T> {
    items: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Group {
    id: number;
    name: string;
    status: string;
    course?: { id: number; name: string; price: number };
}

export interface Lesson {
    id: number;
    title: string;
    date: string;
    status: string;
    group?: { id: number; name: string };
}

export interface Payment {
    id: number;
    amount: number | string;
    method: "CASH" | "CARD" | "TRANSFER";
    paidAt: string;
    student: { user: { firstName: string; lastName: string; phone: string } };
}

export interface DashboardReport {
    stats: {
        totalStudents: number;
        totalTeachers: number;
        activeGroups: number;
        monthlyRevenue: number;
        totalRevenue: number;
        attendanceRate: number;
    };
    courseDistribution: Array<{
        id: number;
        name: string;
        studentsCount: number;
    }>;
    recentPayments: Array<{
        id: number;
        studentName: string;
        amount: number;
        method: string;
        paidAt: string;
    }>;
}
