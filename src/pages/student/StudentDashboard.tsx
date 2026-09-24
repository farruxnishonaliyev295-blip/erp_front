import React, { useEffect, useState } from "react";
import {
  Wallet,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/lib/AuthContext";
import { dashboardApi } from "@/api/services/dashboardApi";

const money = (n: any) => Number(n || 0).toLocaleString("uz-UZ") + " so‘m";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await dashboardApi.student();
      setD(response);
    } catch (e: any) {
      console.error("Student dashboard error:", e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Dashboardni yuklab bo‘lmadi",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Dashboard yuklanmoqda...</div>;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={() => void load()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex gap-2 items-center">
          <RefreshCw className="w-4 h-4" />
          Qayta yuklash
        </button>
      </div>
    );
  }

  if (!d) return <div className="p-8 text-center text-muted-foreground">Dashboard ma'lumotlari topilmadi.</div>;

  const groups = Array.isArray(d.groups) ? d.groups : [];
  const weekLessons = Array.isArray(d.weekLessons) ? d.weekLessons : [];
  const homeworks = Array.isArray(d.homeworks) ? d.homeworks : [];
  const group = groups[0];
  const pending = homeworks.filter((h: any) => !h?.submission || h?.submission?.status === "PENDING").length;
  const attendanceRate = Number(d.attendanceRate || 0);

  return (
    <div className="space-y-6">
      <div className="relative navy-gradient rounded-2xl p-6 lg:p-8 text-white overflow-hidden">
        <p className="text-white/60 text-sm">Salom, 👋</p>
        <h2 className="font-heading font-bold text-2xl lg:text-3xl mt-1">{user?.firstName || ""} {user?.lastName || ""}</h2>
        <p className="text-white/60 mt-1">
          {group ? [group?.course?.name, group?.name].filter(Boolean).join(" · ") : "Guruh biriktirilmagan"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Joriy balans" value={money(d.balance)} accent="amber" />
        <StatCard icon={CalendarCheck} label="Bu hafta darslar" value={weekLessons.length} accent="accent" />
        <StatCard icon={BookOpen} label="Faol vazifalar" value={pending} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Haftalik darslar</h3>
          <div className="space-y-3">
            {weekLessons.map((lesson: any) => (
              <div key={lesson.id} className="p-4 rounded-xl border border-border flex items-center gap-4">
                <CalendarCheck className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <b>{lesson?.title || lesson?.name || "Dars"}</b>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline w-3 h-3 mr-1" />
                    {lesson?.date ? new Date(lesson.date).toLocaleString("uz-UZ") : "Sana belgilanmagan"} · {lesson?.status || ""}
                  </p>
                </div>
              </div>
            ))}
            {!weekLessons.length && <p className="text-sm text-muted-foreground">Bu hafta darslar yo‘q.</p>}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Uy vazifalari</h3>
          <div className="space-y-3">
            {homeworks.slice(0, 8).map((homework: any) => (
              <div key={homework.id} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <b>{homework?.title || homework?.name || "Uy vazifasi"}</b>
                  <p className="text-xs text-muted-foreground">
                    {homework?.lessonTitle || "—"} · {homework?.deadline ? new Date(homework.deadline).toLocaleDateString("uz-UZ") : "—"}
                  </p>
                </div>
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${homework?.submission ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            ))}
            {!homeworks.length && <p className="text-sm text-muted-foreground">Vazifalar yo‘q.</p>}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Umumiy davomat</p>
            <p className="text-3xl font-bold mt-1">{attendanceRate}%</p>
          </div>
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
        <div className="h-2 rounded-full bg-muted mt-5 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(attendanceRate, 0), 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
