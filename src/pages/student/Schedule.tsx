import { useEffect, useState } from "react";
import { studentsApi } from "@/api/services/studentsApi";
import { lessonsApi } from "@/api/services/lessonsApi";
import { formatDate, timeOf } from "@/lib/format";

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

export default function Schedule() {
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    studentsApi.my()
      .then(async (res) => {
        const p = res as { studentGroups?: Array<{ group: { id: number; name: string } }> };
        const groups = (p.studentGroups || []).map((sg) => sg.group);
        const nested = await Promise.all(
          groups.map((g) => lessonsApi.list({ groupId: g.id, limit: 100 }).then((r) => (r.items as LessonRow[]) || [])),
        );
        return nested.flat();
      })
      .then((all) => {
        if (!alive) return;
        all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRows(all.slice(0, 100));
      })
      .catch((err) => { if (alive) setError(err.message || "Dars jadvalini yuklashda xatolik"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Dars jadvali</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{rows.length} ta dars</p>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3.5 font-medium">Sana</th>
                  <th className="px-6 py-3.5 font-medium">Vaqt</th>
                  <th className="px-6 py-3.5 font-medium">Guruh</th>
                  <th className="px-6 py-3.5 font-medium">Dars</th>
                  <th className="px-6 py-3.5 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDate(l.date)}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{timeOf(l.date)}</td>
                    <td className="px-6 py-3.5 font-medium">{l.group?.name || "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{l.title}</td>
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
      {!loading && !error && rows.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">Dars topilmadi.</p>
      )}
    </div>
  );
}
