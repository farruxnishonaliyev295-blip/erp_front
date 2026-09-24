import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Save, Users2, AlertCircle } from "lucide-react";
import { groupsApi, type GroupDetails } from "@/api/services/groupsApi";
import { lessonsApi } from "@/api/services/lessonsApi";
import { attendanceApi } from "@/api/services/attendanceApi";
import { profileApi } from "@/api/services/profileApi";

type Mark = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
interface Row { studentId: number; fullName: string; phone?: string; status: Mark | null; reason?: string | null }

const unwrapRows = (r: any): any[] => {
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.rows)) return r.rows;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r?.students)) return r.students;
  return [];
};

const studentName = (s: any) => {
  const u = s?.student?.user ?? s?.user ?? s;
  return [u?.firstName, u?.lastName].filter(Boolean).join(" ") || s?.fullName || `Talaba #${s?.id ?? ""}`;
};

export default function Attendance() {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<number>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonId, setLessonId] = useState<number>();
  const [rows, setRows] = useState<Row[]>([]);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me: any = await profileApi.me();
        const teacherId = me?.teacherProfile?.id;
        const r: any = await groupsApi.list({ ...(teacherId ? { teacherId } : {}), limit: 100 } as any);
        const list = r?.items || [];
        if (alive) {
          setGroups(list);
          setGroupId(list[0]?.id);
        }
      } catch (e: any) {
        if (alive) setError(e?.message || "O‘qituvchi guruhlari yuklanmadi");
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!groupId) {
      setLessons([]);
      setLessonId(undefined);
      setRows([]);
      return;
    }
    let alive = true;
    setLoading(true);
    setError("");
    lessonsApi.list({ groupId, limit: 100 })
      .then((r: any) => {
        const list = (r?.items || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (alive) {
          setLessons(list);
          setLessonId(list[0]?.id);
        }
      })
      .catch((e: any) => alive && setError(e?.message || "Darslar yuklanmadi"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [groupId]);

  const load = async () => {
    if (!lessonId || !groupId) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      // Attendance endpointda mavjud belgilarni olamiz.
      const attendanceResponse: any = await attendanceApi.lesson(lessonId);
      const attendanceRows = unwrapRows(attendanceResponse);

      // Ba'zi backend versiyalarida attendance/lesson faqat belgilangan
      // talabalarni qaytaradi. Bunday holatda guruh tarkibini fallback sifatida olamiz.
      let groupStudents: any[] = [];
      try {
        const detail: GroupDetails = await groupsApi.get(groupId);
        groupStudents = detail?.studentGroups || [];
      } catch {
        // Attendance ma'lumotining o'zi yetarli bo'lsa, xatoni ko'rsatmaymiz.
      }

      const byId = new Map<number, Row>();
      groupStudents.forEach((item: any) => {
        const u = item?.student?.user;
        const id = Number(item?.student?.id ?? u?.id ?? item?.studentId ?? item?.id);
        if (!id) return;
        byId.set(id, {
          studentId: id,
          fullName: studentName(item),
          phone: u?.phone,
          status: null,
          reason: null,
        });
      });

      attendanceRows.forEach((item: any) => {
        const id = Number(item?.studentId ?? item?.student?.id ?? item?.id);
        if (!id) return;
        const existing = byId.get(id);
        byId.set(id, {
          studentId: id,
          fullName: item?.fullName || existing?.fullName || studentName(item),
          phone: item?.phone || existing?.phone,
          status: item?.status ?? existing?.status ?? null,
          reason: item?.reason ?? existing?.reason ?? null,
        });
      });

      const result = [...byId.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, "uz"));
      setRows(result);

      const nextMarks: Record<number, Mark> = {};
      const nextReasons: Record<number, string> = {};
      result.forEach((row) => {
        if (row.status) nextMarks[row.studentId] = row.status;
        if (row.reason) nextReasons[row.studentId] = row.reason;
      });
      setMarks(nextMarks);
      setReasons(nextReasons);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Davomatni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [lessonId, groupId]);

  const summary = useMemo(() => {
    const values = Object.values(marks);
    return {
      present: values.filter(x => x === "PRESENT").length,
      late: values.filter(x => x === "LATE").length,
      absent: values.filter(x => x === "ABSENT").length,
      excused: values.filter(x => x === "EXCUSED").length,
      total: rows.length,
    };
  }, [marks, rows.length]);

  const save = async () => {
    if (!lessonId || !rows.length) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await attendanceApi.mark(
        lessonId,
        rows.map(r => ({
          studentId: r.studentId,
          status: marks[r.studentId] || "PRESENT",
          reason: reasons[r.studentId] || undefined,
        })),
      );
      setMessage("Davomat muvaffaqiyatli saqlandi.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Davomat saqlanmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="erp-page-banner">
        <div className="erp-banner-icon"><Users2 className="w-7 h-7" /></div>
        <div className="erp-banner-copy">
          <h2 className="erp-page-title">Davomat</h2>
          <p className="erp-page-subtitle">Guruhdagi barcha talabalar bo‘yicha davomatni belgilang</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="ml-auto h-10 px-3 rounded-xl border bg-white inline-flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Yangilash
        </button>
      </div>

      {message && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">{message}</div>}
      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold">Guruh</span>
          <select className="erp-form-control mt-1" value={groupId || ""} onChange={e => setGroupId(Number(e.target.value) || undefined)}>
            <option value="">Guruhni tanlang</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Dars</span>
          <select className="erp-form-control mt-1" value={lessonId || ""} onChange={e => setLessonId(Number(e.target.value) || undefined)}>
            <option value="">Darsni tanlang</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title || l.name || "Dars"} — {l.date ? new Date(l.date).toLocaleString("uz-UZ") : "Sana yo‘q"}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Jami" value={summary.total} cls="text-foreground" />
        <Stat label="Keldi" value={summary.present} cls="text-emerald-600" />
        <Stat label="Kechikdi" value={summary.late} cls="text-amber-600" />
        <Stat label="Kelmadi" value={summary.absent} cls="text-red-600" />
        <Stat label="Sababli" value={summary.excused} cls="text-blue-600" />
      </div>

      <div className="erp-table-shell">
        <div className="erp-table-scroll">
          <table className="w-full min-w-[950px] text-sm">
            <thead><tr className="bg-[#f4f8f4] text-left">
              <th className="px-5 py-4">№</th><th className="px-5 py-4">Talaba</th><th className="px-5 py-4">Telefon</th>
              <th className="px-5 py-4">Keldi</th><th className="px-5 py-4">Kechikdi</th><th className="px-5 py-4">Kelmadi</th><th className="px-5 py-4">Sababli</th><th className="px-5 py-4">Izoh</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Talabalar yuklanmoqda...</td></tr> :
                rows.map((r, index) => (
                  <tr key={r.studentId} className="border-t border-border hover:bg-muted/20">
                    <td className="px-5 py-4 text-muted-foreground">{index + 1}</td>
                    <td className="px-5 py-4 font-semibold">{r.fullName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.phone || "—"}</td>
                    {(["PRESENT", "LATE", "ABSENT", "EXCUSED"] as Mark[]).map(st => (
                      <td key={st} className="px-5 py-4">
                        <button type="button" onClick={() => setMarks(m => ({ ...m, [r.studentId]: st }))}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${marks[r.studentId] === st ? (st === "PRESENT" ? "bg-emerald-600 text-white" : st === "LATE" ? "bg-amber-500 text-white" : st === "ABSENT" ? "bg-red-600 text-white" : "bg-blue-600 text-white") : "bg-white hover:bg-muted"}`}>
                          {marks[r.studentId] === st && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                    ))}
                    <td className="px-5 py-4"><input className="erp-form-control min-w-[180px]" value={reasons[r.studentId] || ""} onChange={e => setReasons(x => ({ ...x, [r.studentId]: e.target.value }))} placeholder="Izoh" /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && !rows.length && <div className="p-12 text-center text-muted-foreground">Tanlangan guruhda talaba topilmadi yoki guruh tarkibini olishda xatolik yuz berdi.</div>}
        </div>
      </div>

      <div className="flex justify-end">
        <button disabled={saving || !rows.length || !lessonId} onClick={save} className="h-11 px-6 rounded-xl accent-gradient text-white font-bold inline-flex items-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? "Saqlanmoqda..." : "Davomatni saqlash"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return <div className="bg-white border rounded-2xl p-4"><div className={`text-2xl font-black ${cls}`}>{value}</div><div className="text-xs text-muted-foreground mt-1">{label}</div></div>;
}
