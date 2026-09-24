import React, { useEffect, useState } from "react";
import {
  Users2,
  CalendarCheck,
  ClipboardList,
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { dashboardApi } from "@/api/services/dashboardApi";

export default function TeacherDashboard() {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await dashboardApi.teacher();
      setD(response);
    } catch (e: any) {
      console.error("Teacher dashboard error:", e);
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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Dashboard yuklanmoqda...</div>;
  }

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
  const lessons = Array.isArray(d.lessons) ? d.lessons : [];
  const studentsCount = groups.reduce(
    (sum: number, group: any) =>
      sum + Number(group?._count?.studentGroups || group?.studentsCount || group?.studentCount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="erp-page-banner">
        <div>
          <h2 className="erp-page-title">O‘qituvchi dashboard</h2>
          <p className="erp-page-subtitle">Sizga biriktirilgan guruhlar va darslar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users2} label="Guruhlarim" value={groups.length} accent="primary" />
        <StatCard icon={Users2} label="Talabalarim" value={studentsCount} accent="accent" />
        <StatCard icon={CalendarCheck} label="Bu hafta darslar" value={d.weekLessonsCount ?? lessons.length} accent="green" />
        <StatCard icon={ClipboardList} label="Tekshirilmagan vazifa" value={d.pendingHomeworkCount ?? d.pendingCount ?? 0} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Mening guruhlarim</h3>
          <div className="space-y-3">
            {groups.map((group: any) => (
              <div key={group.id} className="p-4 rounded-xl border border-border">
                <div className="flex justify-between items-center gap-3">
                  <b>{group?.name || "Nomsiz guruh"}</b>
                  <span className="text-xs px-2 py-1 rounded-lg bg-accent/10 text-accent">
                    {group?._count?.studentGroups || group?.studentsCount || 0} talaba
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{group?.course?.name || "—"}</p>
                {group?.schedules?.[0] && (
                  <p className="text-xs text-muted-foreground mt-3">
                    <Clock className="inline w-3 h-3 mr-1" />
                    {group.schedules[0]?.startTime || "--:--"} - {group.schedules[0]?.endTime || "--:--"}
                    <MapPin className="inline w-3 h-3 ml-2 mr-1" />
                    {group.schedules[0]?.room?.name || "Xona belgilanmagan"}
                  </p>
                )}
              </div>
            ))}
            {!groups.length && <p className="text-muted-foreground text-sm">Guruhlar mavjud emas.</p>}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Yaqin darslar</h3>
          <div className="space-y-3">
            {lessons.map((lesson: any) => (
              <div key={lesson.id} className="p-4 rounded-xl border border-border">
                <b>{lesson?.title || lesson?.name || "Dars"}</b>
                <p className="text-xs text-muted-foreground mt-1">
                  {lesson?.group?.name || lesson?.groupName || "—"} · {lesson?.date ? new Date(lesson.date).toLocaleString("uz-UZ") : "Sana belgilanmagan"}
                </p>
              </div>
            ))}
            {!lessons.length && <p className="text-muted-foreground text-sm">Yaqin darslar mavjud emas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
