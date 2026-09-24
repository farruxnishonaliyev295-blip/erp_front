import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

type Role = 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const SessionCheckError = ({ message, retry }: { message: string; retry: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center p-6">
    <div className="max-w-md rounded-xl border border-destructive/20 bg-card p-6 text-center shadow-sm">
      <p className="font-semibold">Unable to verify your session</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <button className="mt-4 text-sm font-medium text-primary hover:underline" onClick={retry}>
        Try again
      </button>
    </div>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement,
  allowedRoles,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError?.type === 'auth_required') {
    return unauthenticatedElement;
  }

  if (authError?.type === 'unknown') {
    return <SessionCheckError message={authError.message} retry={() => void checkUserAuth()} />;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role as Role)) {
    const dashboardByRole: Record<Role, string> = {
      SUPERADMIN: '/admin',
      ADMIN: '/admin',
      TEACHER: '/teacher',
      STUDENT: '/student',
    };
    return <Navigate to={dashboardByRole[user?.role as Role] || '/login'} replace />;
  }

  return <Outlet />;
}
