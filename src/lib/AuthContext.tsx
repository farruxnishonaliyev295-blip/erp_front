import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiClient } from "@/api/apiClient";
import { authApi } from "@/api/services/authApi";
import type { User } from "@/api/types";

type AuthError = { type: "auth_required" | "unknown"; message: string };

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: AuthError | null;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Vite hot-reload paytida provider va consumer turli modul nusxalarini ushlab
// qolishi mumkin. Contextni global registryda saqlash ularning bitta instansdan
// foydalanishini kafolatlaydi.
const authContextRegistryKey = "__eduflow_auth_context__";
const authContextRegistry = globalThis as typeof globalThis & {
  [authContextRegistryKey]?: ReturnType<typeof createContext<AuthContextValue | undefined>>;
};
const AuthContext = authContextRegistry[authContextRegistryKey] ?? createContext<AuthContextValue | undefined>(undefined);
authContextRegistry[authContextRegistryKey] = AuthContext;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const errorStatus = (error: unknown) =>
  typeof error === "object" && error !== null && "status" in error
    ? (error as { status?: number }).status
    : undefined;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    // accessToken endi httpOnly cookie'da — JS uni o'qiy olmaydi, shuning
    // uchun oldindan "bormi-yo'qmi" tekshirmasdan, to'g'ridan-to'g'ri
    // /auth/me'ga so'rov yuboramiz. Cookie mavjud bo'lmasa yoki yaroqsiz
    // bo'lsa, backend 401 qaytaradi va bu quyidagi catch blokida ushlanadi.
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      // 401/403 — bu shunchaki "hozircha login qilinmagan" degani, bu ODDIY
      // holat (masalan, /login sahifasiga birinchi marta kirganda ham xuddi
      // shu javob keladi) — buni "xato" deb belgilamaymiz, aks holda /login
      // sahifasining o'zi ham ko'rsatilmay qoladi (App.tsx authError bo'lsa
      // butun Routes daraxtini render qilmaydi). Faqat haqiqiy tarmoq/server
      // xatolarini (5xx, ulanish uzilishi) authError sifatida belgilaymiz.
      if (errorStatus(error) !== 401 && errorStatus(error) !== 403) {
        setAuthError({
          type: "unknown",
          message: errorMessage(error, "Unable to verify your session"),
        });
      }
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    void checkUserAuth();
  }, [checkUserAuth]);

  // Faqat "user" ma'lumotini fon rejimida yangilaydi (masalan, profil saqlangandan
  // yoki rasm yuklangandan keyin) — isLoadingAuth/authChecked'ga tegmaydi,
  // shuning uchun butun ilova qayta chizilib, "refresh"dek miltillamaydi.
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      // Jimgina o'tkazib yuboriladi — agar sessiya haqiqatan tugagan bo'lsa,
      // keyingi har qanday himoyalangan so'rov baribir 401 qaytaradi va
      // ProtectedRoute/AuthenticatedApp buni odatdagidek ushlab oladi.
    }
  }, []);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    void apiClient.logout(shouldRedirect);
  };

  const navigateToLogin = () => {
    apiClient.redirectToLogin();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, authError, authChecked, logout, navigateToLogin, checkUserAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
