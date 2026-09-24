import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { groupsApi, type GroupDetails } from "@/api/services/groupsApi";
import { timeRange, weekDaysShort, initialsOf } from "@/lib/format";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  groupName: string;
};

type TeacherRow = { role?: string; teacher?: { user?: { firstName?: string; lastName?: string } } };
type ScheduleRow = { weekDay: string; startTime: string; endTime: string };

export default function GroupTeachersModal({ open, onOpenChange, groupId, groupName }: Props) {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !groupId) return;
    setLoading(true);
    setGroup(null);
    groupsApi.get(groupId)
      .then((res) => setGroup(res as GroupDetails))
      .catch(() => setGroup(null))
      .finally(() => setLoading(false));
  }, [open, groupId]);

  const g = group as unknown as { groupTeachers?: TeacherRow[]; schedules?: ScheduleRow[] } | null;
  const teachers = g?.groupTeachers || [];
  const schedules = g?.schedules || [];
  const main = teachers.filter((t) => (t.role || "MAIN") === "MAIN");
  const assistants = teachers.filter((t) => t.role === "ASSISTANT");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl border border-border bg-card p-6">
        <DialogTitle className="font-heading text-xl font-bold pr-6">{groupName}</DialogTitle>
        {loading && <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda...</p>}
        {!loading && teachers.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">Bu guruhga o'qituvchi biriktirilmagan.</p>
        )}
        {!loading && main.length > 0 && <Section title="Asosiy o'qituvchi" rows={main} schedules={schedules} />}
        {!loading && assistants.length > 0 && <Section title="Yordamchilar" rows={assistants} schedules={schedules} />}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, rows, schedules }: { title: string; rows: TeacherRow[]; schedules: ScheduleRow[] }) {
  const times = Array.from(new Set(schedules.map((s) => timeRange(s.startTime, s.endTime)))).join(" / ");
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="mt-2 rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">O'qituvchi</th>
              <th className="px-4 py-2.5 font-medium">Roli</th>
              <th className="px-4 py-2.5 font-medium">Dars kunlari</th>
              <th className="px-4 py-2.5 font-medium">Dars vaqti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t, i) => (
              <tr key={i}>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full accent-gradient text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {initialsOf(t.teacher?.user?.firstName, t.teacher?.user?.lastName)}
                    </span>
                    <span className="font-medium">
                      {(t.teacher?.user?.firstName || "") + " " + (t.teacher?.user?.lastName || "")}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {(t.role || "MAIN") === "MAIN" ? "O'qituvchi" : "Yordamchi"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{weekDaysShort(schedules)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{times || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
