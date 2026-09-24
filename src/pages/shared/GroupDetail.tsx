import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { groupsApi, type GroupDetails } from "@/api/services/groupsApi";
import { homeworkApi } from "@/api/services/homeworkApi";
import { lessonsApi } from "@/api/services/lessonsApi";
import { formatDate, weekDaysShort } from "@/lib/format";
import StatusFilterDropdown from "@/components/shared/StatusFilterDropdown";
import { HomeworkStatusPill, deriveHwStatus } from "@/components/shared/HomeworkStatus";

type HwRow = {
  id: number;
  title: string;
  deadline: string;
  lessonId: number;
  _count?: { submissions: number };
};

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const groupId = Number(id);

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [hws, setHws] = useState<HwRow[]>([]);
  const [lessonDates, setLessonDates] = useState<Record<number, string>>({});
  const [subs, setSubs] = useState<Record<number, { status?: string }>>({});
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      groupsApi.get(groupId),
      homeworkApi.list(groupId),
      lessonsApi.list({ groupId, limit: 100 }),
      isStudent ? homeworkApi.mySubmissions() : Promise.resolve([]),
    ])
      .then((results) => {
        if (!alive) return;
        const g = results[0] as GroupDetails;
        const h = (results[1] as HwRow[]) || [];
        const l = results[2] as { items?: Array<{ id: number; date: string }> };
        const s = results[3];
        setGroup(g);
        setHws(h);
        const map: Record<number, string> = {};
        (l.items || []).forEach((ls) => { map[ls.id] = ls.date; });
        setLessonDates(map);
        const sm: Record<number, { status?: string }> = {};
        const arr = Array.isArray(s) ? (s as Array<{ homeworkId?: number; status?: string }>) : ((s as { items?: Array<{ homeworkId?: number; status?: string }> })?.items || []);
        arr.forEach((x) => { if (x.homeworkId) sm[x.homeworkId] = { status: x.status }; });
        setSubs(sm);
      })
      .catch((err) => setError(err.message || "Ma'lumot yuklashda xatolik"))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [groupId, isStudent]);

  const filtered = !isStudent || filter === "ALL"
    ? hws
    : hws.filter((h) => deriveHwStatus(h, subs[h.id]) === filter);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Ortga
      </button>
      <h2 className="mt-3 font-heading text-2xl font-bold">{group?.name || "Guruh"}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        {group?.course?.name || ""}
        {group?.schedules && group.schedules.length > 0 ? " • " + weekDaysShort(group.schedules) : ""}
      </p>

      {isStudent && (
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Uy vazifa statusi</span>
          <StatusFilterDropdown value={filter} onChange={setFilter} />
        </div>
      )}

      {loading && <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <div className={"bg-card rounded-2xl border border-border overflow-hidden " + (isStudent ? "mt-4" : "mt-6")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-6 py-3.5 font-medium">Uy vazifasi</th>
                    {isStudent
                      ? <th className="px-6 py-3.5 font-medium">Uyga vazifa holati</th>
                      : <th className="px-6 py-3.5 font-medium">Topshirganlar</th>}
                    <th className="px-6 py-3.5 font-medium">Uyga vazifa tugash vaqti</th>
                    <th className="px-6 py-3.5 font-medium">Dars sanasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium">{h.title}</td>
                      {isStudent
                        ? <td className="px-6 py-3.5"><HomeworkStatusPill status={deriveHwStatus(h, subs[h.id])} /></td>
                        : <td className="px-6 py-3.5">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-muted text-sm font-semibold">
                              {h._count?.submissions ?? 0}
                            </span>
                          </td>}
                      <td className="px-6 py-3.5 text-muted-foreground">{formatDate(h.deadline)}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {lessonDates[h.lessonId] ? formatDate(lessonDates[h.lessonId]) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">Uy vazifasi topilmadi.</p>
          )}
        </>
      )}
    </div>
  );
}
