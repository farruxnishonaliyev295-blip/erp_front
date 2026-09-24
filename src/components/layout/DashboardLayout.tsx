import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles = {
  "/admin": ["Admin Dashboard", "Umumiy ko'rinish va statistika"],
  "/admin/students": ["Talabalar", "Barcha talabalar ro'yxati"],
  "/admin/teachers": ["O'qituvchilar", "O'qituvchilar va maoshlar"],
  "/admin/courses": ["Kurslar", "O'quv kurslari katalogi"],
  "/admin/groups": ["Guruhlar", "O'quv guruhlari"],
  "/admin/payments": ["To'lovlar", "To'lovlar tarixi va balans"],
  "/admin/rooms": ["Xonalar", "Sinflar va sig'im"],
  "/admin/reports": ["Hisobotlar", "Tahlil va hisobotlar"],
  "/teacher": ["O'qituvchi Dashboard", "Darslar va guruhlar"],
  "/teacher/groups": ["Guruhlarim", "Mening guruhlarim"],
  "/teacher/lessons": ["Darslar", "Darslar jadvali"],
  "/teacher/attendance": ["Davomat", "Davomadni belgilash"],
  "/teacher/homework": ["Uy vazifalari", "Topshirilgan vazifalar"],
  "/student": ["Talaba Dashboard", "Darslar va vazifalar"],
  "/student/schedule": ["Dars jadvali", "Haftalik jadval"],
  "/student/homework": ["Uy vazifalari", "Vazifalar va baholar"],
  "/student/payments": ["To'lovlar", "To'lovlar tarixi"],
  "/profile": ["Profil", "Shaxsiy ma'lumotlar va parol"],
  "/notifications": ["Bildirishnomalar", "Tizim xabarlari va eslatmalar"],
  "/library": ["Kutubxona", "Raqamli resurslar markazi"],
  "/exams": ["Imtihonlar", "Natijalar va baholash jarayoni"],
  "/settings": ["Sozlamalar", "Hisob va tizim parametrlari"],
  "/help-center": ["Yordam markazi", "Savollar va yordam olish"],
};

export default function DashboardLayout({ role }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Umumiy sahifalar (/profile, /library, ...) uchun oxirgi faol rolni saqlab qolamiz
  const resolvedRole = role || localStorage.getItem("learnix-role") || "ADMIN";

  useEffect(() => {
    if (role) localStorage.setItem("learnix-role", role);
  }, [role]);

  const [title, subtitle] = titles[location.pathname] || ["Dashboard", ""];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={resolvedRole}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar role={resolvedRole} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"}`}>
        <Topbar title={title} subtitle={subtitle} role={resolvedRole} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}