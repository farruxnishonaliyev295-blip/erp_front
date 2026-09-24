import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from './pages/Login';
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const Students = lazy(() => import('@/pages/admin/Students'));
const StudentsArchive = lazy(() => import('@/pages/admin/StudentsArchive'));
const Teachers = lazy(() => import('@/pages/admin/Teachers'));
const TeachersArchive = lazy(() => import('@/pages/admin/TeachersArchive'));
const Admins = lazy(() => import('@/pages/admin/Admins'));
const AdminsArchive = lazy(() => import('@/pages/admin/AdminsArchive'));
const Courses = lazy(() => import('@/pages/admin/Courses'));
const Groups = lazy(() => import('@/pages/admin/Groups'));
const Payments = lazy(() => import('@/pages/admin/Payments'));
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const Reports = lazy(() => import('@/pages/admin/Reports'));
const Rooms = lazy(() => import('@/pages/admin/Rooms'));
const Attendance = lazy(() => import('@/pages/teacher/Attendance'));
const Profile = lazy(() => import('@/pages/Profile'));
const Notifications = lazy(() => import('@/pages/Notification'));
const Library = lazy(() => import('@/pages/Library'));
const Exams = lazy(() => import('@/pages/Exams'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ChangePassword = lazy(() => import('@/pages/ChangePassword'));
const MyGroups = lazy(() => import('@/pages/shared/MyGroups'));
const GroupDetail = lazy(() => import('@/pages/shared/GroupDetail'));
const Homeworks = lazy(() => import('@/pages/shared/Homeworks'));
const TeacherLessons = lazy(() => import('@/pages/teacher/Lessons'));
const StudentSchedule = lazy(() => import('@/pages/student/Schedule'));
const StudentPayments = lazy(() => import('@/pages/student/Payments'));

// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'auth_required') {
      return <Navigate to="/login" replace />;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']} unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route element={<DashboardLayout role="ADMIN" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/students/archive" element={<StudentsArchive />} />
              <Route path="/admin/teachers" element={<Teachers />} />
              <Route path="/admin/teachers/archive" element={<TeachersArchive />} />
              <Route path="/admin/admins" element={<Admins />} />
              <Route path="/admin/admins/archive" element={<AdminsArchive />} />
              <Route path="/admin/courses" element={<Courses />} />
              <Route path="/admin/groups" element={<Groups />} />
              <Route path="/admin/payments" element={<Payments />} />
              <Route path="/admin/rooms" element={<Rooms />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route element={<DashboardLayout role="TEACHER" />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/groups" element={<MyGroups />} />
              <Route path="/teacher/groups/:id" element={<GroupDetail />} />
              <Route path="/teacher/lessons" element={<TeacherLessons />} />
              <Route path="/teacher/homework" element={<Homeworks />} />
              <Route path="/teacher/attendance" element={<Attendance />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route element={<DashboardLayout role="STUDENT" />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/groups" element={<MyGroups />} />
              <Route path="/student/groups/:id" element={<GroupDetail />} />
              <Route path="/student/schedule" element={<StudentSchedule />} />
              <Route path="/student/homework" element={<Homeworks />} />
              <Route path="/student/payments" element={<StudentPayments />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT']} unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/library" element={<Library />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help-center" element={<HelpCenter />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
