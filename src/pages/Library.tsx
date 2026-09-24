import { useEffect, useMemo, useState } from "react";
import { BookMarked, BookOpen, FileText, Search, RefreshCw, GraduationCap, Clock3 } from "lucide-react";
import { coursesApi, type Course } from "@/api/services/coursesApi";

export default function Library() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response: any = await coursesApi.list({ limit: 100 });
      setCourses(response?.items || []);
    } catch (e: any) {
      setError(e?.message || "Kutubxona resurslarini yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => courses.filter(c => {
    const q = search.trim().toLowerCase();
    const textOk = !q || `${c.name} ${c.description || ""}`.toLowerCase().includes(q);
    const statusOk = status === "ALL" || c.status === status;
    return textOk && statusOk;
  }), [courses, search, status]);

  const active = courses.filter(c => c.status === "ACTIVE").length;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="erp-page-banner">
        <div className="erp-banner-icon"><BookMarked className="w-8 h-8" /></div>
        <div>
          <h2 className="erp-page-title">Kutubxona</h2>
          <p className="erp-page-subtitle">Kurslar va o‘quv materiallarini bir joydan toping</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="ml-auto h-10 px-3 rounded-xl border bg-white inline-flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard icon={BookOpen} title="Jami kurslar" value={courses.length} />
        <InfoCard icon={GraduationCap} title="Faol kurslar" value={active} />
        <InfoCard icon={FileText} title="Topilgan resurslar" value={filtered.length} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="erp-form-control pl-10" placeholder="Kurs yoki material nomini qidiring..." />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3.5 h-10 rounded-xl border text-sm ${status === s ? "bg-primary text-primary-foreground" : "bg-card border-border"}`}>
              {s === "ALL" ? "Barchasi" : s === "ACTIVE" ? "Faol" : "Nofaol"}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">{error}</div>}

      {loading ? <div className="p-12 text-center text-muted-foreground">Kutubxona yuklanmoqda...</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(course => (
            <article key={course.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-primary" /></div>
                <span className={`text-xs px-2.5 py-1 rounded-lg ${course.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                  {course.status === "ACTIVE" ? "Faol" : "Nofaol"}
                </span>
              </div>
              <h3 className="font-bold text-lg mt-4">{course.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.description || "Ushbu kurs uchun o‘quv materiallari va dars resurslari."}</p>
              <div className="flex flex-wrap gap-3 mt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{course.durationHours || 0} soat</span>
                <span>{course.durationMonth || 0} oy</span>
                <span>{course._count?.groups || 0} guruh</span>
              </div>
            </article>
          ))}
        </div>
      }

      {!loading && !filtered.length && !error && <div className="bg-card border border-border rounded-2xl p-12 text-center"><BookMarked className="w-10 h-10 mx-auto mb-4 text-muted-foreground" /><p className="font-medium">Resurs topilmadi</p><p className="text-sm text-muted-foreground mt-1">Qidiruv yoki filtrni o‘zgartirib ko‘ring.</p></div>}
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{title}</p><p className="text-2xl font-black mt-0.5">{value}</p></div></div>;
}
