import type { User } from "./types";

const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api"
).replace(/\/$/, "");

type ApiError = Error & { status?: number; data?: unknown };

let refreshPromise: Promise<boolean> | null = null;
const onUnauthorized: Array<() => void> = [];

export const setUnauthorizedHandler = (fn: () => void) => {
    onUnauthorized.push(fn);
};

const buildQuery = (query?: Record<string, string | number | undefined>) => {
    if (!query) return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
        }
    }
    const s = params.toString();
    return s ? `?${s}` : "";
};

const rawRequest = async <T>(
    path: string,
    init: RequestInit = {},
): Promise<T> => {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    // Diqqat: Authorization header endi kerak emas — accessToken httpOnly
    // cookie'da, brauzer uni "credentials: include" orqali o'zi yuboradi.

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers,
        credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(
            typeof data?.message === "string" ? data.message : "Request failed",
        ) as ApiError;
        error.status = response.status;
        error.data = data;
        throw error;
    }
    if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        data.success === true &&
        "data" in data
    ) {
        return data.data as T;
    }
    return data as T;
};

const refreshTokens = async (): Promise<boolean> => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        try {
            // refreshToken cookie'si JS'ga ko'rinmaydi (httpOnly) — shuning uchun
            // oldindan tekshirmasdan, to'g'ridan-to'g'ri so'rov yuboramiz.
            // Cookie mavjud bo'lmasa, backend shunchaki 401 qaytaradi.
            await rawRequest("/auth/refresh", { method: "POST" });
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();
    return refreshPromise;
};

const request = async <T>(
    path: string,
    init: RequestInit = {},
    retry = true,
): Promise<T> => {
    try {
        return await rawRequest<T>(path, init);
    } catch (error) {
        const apiError = error as ApiError;
        if (retry && apiError.status === 401) {
            const refreshed = await refreshTokens();
            if (refreshed) return request<T>(path, init, false);
            onUnauthorized.forEach((fn) => fn());
        }
        throw error;
    }
};

export const apiClient = {
    request,
    buildQuery,
    async login(identifier: string, password: string) {
        // Backend endi tokenlarni JSON body'da qaytarmaydi — ular Set-Cookie
        // orqali (httpOnly) to'g'ridan-to'g'ri brauzerga o'rnatiladi.
        const data = await request<{
            user: User;
            mustChangePassword: boolean;
        }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ identifier, password }),
        });
        return { user: data.user, mustChangePassword: data.mustChangePassword };
    },
    me() {
        return request("/auth/me");
    },
    async logout(redirect = true) {
        try {
            // refreshToken cookie orqali avtomatik yuboriladi — body kerak emas.
            // Agar sessiya allaqachon tugagan bo'lsa (401), bu — muammo emas,
            // chunki niyatimiz baribir bir xil: chiqib ketish. Shuning uchun
            // xatoni yutamiz — chaqiruvchi tomonga hech qachon otilmaydi.
            await request("/auth/logout", { method: "POST" });
        } catch {
            // jimgina o'tkazib yuboriladi
        } finally {
            if (redirect) window.location.href = "/login";
        }
    },
    redirectToLogin() {
        window.location.href = "/login";
    },
    changePassword(oldPassword: string, newPassword: string) {
        return request("/auth/change-password", {
            method: "PATCH",
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    },
    // Diqqat: bu yerda Content-Type ataylab o'rnatilmaydi — FormData yuborilganda
    // brauzerning o'zi to'g'ri "multipart/form-data; boundary=..." headerini qo'yishi kerak.
    // Agar uni qo'lda "application/json" qilib qo'ysak, server faylni o'qiy olmay qoladi.
    async uploadPhoto(file: File): Promise<User> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${apiBaseUrl}/users/me/photo`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(
                typeof data?.message === "string"
                    ? data.message
                    : "Rasm yuklanmadi",
            ) as ApiError;
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data as User;
    },
    // Admin talaba/o'qituvchi yaratayotganda yoki tahrirlayotganda rasm tanlasa,
    // shu orqali yuklanadi — hech kimning User yozuviga bog'lanmaydi, faqat URL qaytadi.
    // apiClient.ts fayli ichida

    async uploadFile(formData: FormData): Promise<{ url: string; originalName?: string; sizeMb?: number }> {
        const response = await fetch(`${apiBaseUrl}/uploads/file`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(typeof data?.message === "string" ? data.message : "Fayl yuklanmadi") as ApiError;
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return (data?.data ?? data) as { url: string; originalName?: string; sizeMb?: number };
    },
    async uploadGenericPhoto(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${apiBaseUrl}/uploads/photo`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(
                typeof data?.message === "string"
                    ? data.message
                    : "Rasm yuklanmadi",
            ) as ApiError;
            error.status = response.status;
            error.data = data;
            throw error;
        }

        // Backend { success: true, data: { url: "..." } } qaytarayotgani uchun:
        return (data?.data ?? data) as { url: string }; // <--- SHU QATOR O'ZGARTIRILDI
    },
};
