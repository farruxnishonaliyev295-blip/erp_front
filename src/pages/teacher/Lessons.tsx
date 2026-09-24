import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { groupsApi } from "@/api/services/groupsApi";
import { lessonsApi } from "@/api/services/lessonsApi";
import { profileApi } from "@/api/services/profileApi";
import { formatDate, timeOf } from "@/lib/format";
import type { PaginationQuery } from "@/api/types";

type LessonRow = {
  id: number;
  title: string;
  date: string;
  status: string;
  groupId: number;
  group?: { name?: string } | null;
};

const STATUS_PILLS: Record<string, string> = {
  SCHEDULED: "bg-accent/10 text-accent",
  DONE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
};
const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Rejalashtirilgan",
  DONE: "O'tilgan",
  CANCELLED: "Bekor qilingan",
};

export default function Lessons() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"SCHEDULED" | "DONE">("SCHEDULED");
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    setLoading(true);
    profileApi.me()
      .then(async (me) => {
        const tid = (me as unknown as { teacherProfile?: { id?: number } }).teacherProfile?.id;
        const q = { teacherId: tid, limit: 100 } as PaginationQuery;
        const gRes = await groupsApi.list(q);
        const groups = (gRes.items as Array<{ id: number; name: string }>) || [];
        const nested = await Promise.all(
          groups.map((g) => lessonsApi.list({ groupId: g.id, limit: 100 }).then((res) => (res.items as LessonRow[]) || [])),
        );
        return nested.flat();
      })
      .then((all) => {
        if (!alive) return;
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRows(all);
      })
      .catch((err) => { if (alive) setError(err.message || "Darslarni yuklashda xatolik"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user?.id]);

  const filtered = rows.filter((r) => r.status === tab);

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Darslar</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{rows.length} ta dars</p>

      <div className="mt-5 flex items-center gap-6 border-b border-border">
        <TabButton active={tab === "SCHEDULED"} onClick={() => setTab("SCHEDULED")}>Yaqinlashmoqda</TabButton>
        <TabButton active={tab === "DONE"} onClick={() => setTab("DONE")}>O'tilgan</TabButton>
      </div>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3.5 font-medium">Guruh</th>
                  <th className="px-6 py-3.5 font-medium">Dars</th>
                  <th className="px-6 py-3.5 font-medium">Sana</th>
                  <th className="px-6 py-3.5 font-medium">Vaqt</th>
                  <th className="px-6 py-3.5 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium">{l.group?.name || "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{l.title}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDate(l.date)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{timeOf(l.date)}</td>
                    <td className="px-6 py-3.5">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold " + (STATUS_PILLS[l.status] || STATUS_PILLS.SCHEDULED)}>
                        {STATUS_LABELS[l.status] || l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">Dars topilmadi.</p>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"pb-3 text-sm transition-colors " + (active ? "font-semibold text-foreground border-b-2 border-accent" : "font-medium text-muted-foreground hover:text-foreground")}
    >
      {children}
    </button>
  );
}
