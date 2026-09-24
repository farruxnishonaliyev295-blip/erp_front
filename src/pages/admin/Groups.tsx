import React, { useEffect, useState } from "react";
import { Users2, BookOpen, CalendarDays, MapPin, UserCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EntityCard, { type StatusOption as CardStatusOption } from "@/components/ui/EntityCard";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { groupsApi, type GroupDetails } from "@/api/services/groupsApi";
import { coursesApi } from "@/api/services/coursesApi";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/ui/TablePagination";
import EntityTable from "@/components/ui/EntityTable";
import type { Group } from "@/api/types";

type GroupRow = {
  id: number;
  name: string;
  status: string;
  maxStudent: number;
  startDate: string;
  course?: { id: number; name: string; durationMonth?: number; durationHours?: number };
  _count?: { studentGroups: number };
};

const GROUP_STATUS_ACTIONS: CardStatusOption[] = [
  { value: "PLANNED", label: "Rejalashtirilgan", dot: "bg-slate-400" },
  { value: "ACTIVE", label: "Faol", dot: "bg-emerald-500" },
  { value: "COMPLETED", label: "Tugatilgan", dot: "bg-lime-500" },
  { value: "CANCELLED", label: "Nofaol", dot: "bg-red-400" },
];

const WEEKDAY_UZ: Record<string, string> = {
  MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Cho",
  THURSDAY: "Pa", FRIDAY: "Ju", SATURDAY: "Sha", SUNDAY: "Ya",
};

const formatSchedule = (schedules?: GroupDetails["schedules"]) => {
  if (!schedules?.length) return "Belgilanmagan";
  const days = schedules.map((s) => WEEKDAY_UZ[s.weekDay] || s.weekDay).join(", ");
  const time = schedules[0]?.startTime || "";
  return time ? `${days}, ${time}` : days;
};

const getRoomName = (schedules?: GroupDetails["schedules"]) => {
  if (!schedules?.length) return "Biriktirilmagan";
  return schedules.find((s) => s.room?.name)?.room?.name || "Biriktirilmagan";
};

const getTeacherName = (groupTeachers?: GroupDetails["groupTeachers"]) => {
  if (!groupTeachers?.length) return "Biriktirilmagan";
  const u = groupTeachers[0]?.teacher?.user;
  return u ? `${u.firstName} ${u.lastName}` : "Biriktirilmagan";
};

export default function Groups() {
  const [open, setOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupDetails | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchStatusCounts = () => {
    const statuses = ["ACTIVE", "PLANNED", "COMPLETED", "CANCELLED"];
    Promise.all(
      statuses.map((s) => groupsApi.list({ status: s, limit: 1 }).then((r) => [s, r.meta?.total ?? 0] as const)),
    )
      .then((entries) => setStatusCounts(Object.fromEntries(entries)))
      .catch(() => {});
  };

  // View modal
  const [viewGroupId, setViewGroupId] = useState<number | null>(null);
  const [viewGroup, setViewGroup] = useState<GroupDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchGroups = () => {
    setLoading(true);
    groupsApi
      .list({ page, limit, status: statusFilter || undefined })
      .then((res) => {
        setGroups(res.items as GroupRow[]);
        if (res.meta) { setTotal(res.meta.total); setTotalPages(res.meta.totalPages); }
        fetchStatusCounts();
      })
      .catch((err) => setError(err.message || "Guruhlarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchGroups, [page, limit, statusFilter]);

  useEffect(() => {
    if (!viewGroupId) return;
    setViewLoading(true);
    setViewGroup(null);
    groupsApi.get(viewGroupId)
      .then(setViewGroup)
      .catch(() => {})
      .finally(() => setViewLoading(false));
  }, [viewGroupId]);

  const addGroup = async (values: Record<string, string>) => {
    setError("");
    if (editGroup) {
      // Edit mode — faqat asosiy maydonlarni yangilash
      await groupsApi.update(editGroup.id, {
        name: values.name?.trim() || undefined,
        maxStudent: values.maxStudent ? Number(values.maxStudent) : undefined,
      });
      fetchGroups();
      setEditGroup(null);
      return;
    }
    const weekDays = values.weekDays?.split(",").filter(Boolean) || [];
    if (!weekDays.length) throw new Error("Kamida bitta dars kunini tanlang");
    if (!values.startDate) throw new Error("Boshlanish sanasini tanlang");
    if (!values.time) throw new Error("Dars vaqtini tanlang");
    const courses = await coursesApi.list({ limit: 100 });
    const course = courses.items.find((c) => c.id === Number(values.courseId));
    if (!course) throw new Error("Kurs topilmadi");
    const [h, m] = values.time.split(":").map(Number);
    const endMin = h * 60 + m + course.durationHours * 60;
    const endTime = `${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    await groupsApi.create({
      name: values.name.trim(),
      courseId: values.courseId,
      teacherId: values.teacherIds?.split(",").filter(Boolean)[0] || undefined,
      studentIds: values.studentIds ? values.studentIds.split(",").filter(Boolean) : undefined,
      startDate: values.startDate,
      maxStudent: Number(values.maxStudent),
      schedules: weekDays.map((weekDay) => ({
        weekDay,
        roomId: values.roomId || undefined,
        startTime: values.time,
        endTime,
      })),
    });
    fetchGroups();
  };

  const updateStatus = (group: GroupRow, status: string) => {
    groupsApi
      .update(group.id, { status })
      .then(() => setGroups((prev) => prev.map((g) => g.id === group.id ? { ...g, status } : g)))
      .catch((err) => setError(err.message || "Statusni yangilashda xatolik"));
  };

  const deleteGroup = (group: GroupRow) => {
    groupsApi
      .remove(group.id)
      .then(fetchGroups)
      .catch((err) => setError(err.message || "Guruhni o'chirishda xatolik"));
  };

  return (
    <div>
      <PageHeader
        title="Guruhlar"
        subtitle={`${total || groups.length} ta guruh`}
        actionLabel="Yangi guruh"
        onAction={() => setOpen(true)}
      />

      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        {statusCounts.ACTIVE ?? 0} aktiv · {statusCounts.PLANNED ?? 0} rejalashtirilgan · {statusCounts.COMPLETED ?? 0} yakunlangan
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: "Barchasi", value: "", count: total },
          { label: "Aktiv", value: "ACTIVE", count: statusCounts.ACTIVE ?? 0 },
          { label: "Rejalashtirilgan", value: "PLANNED", count: statusCounts.PLANNED ?? 0 },
          { label: "Yakunlangan", value: "COMPLETED", count: statusCounts.COMPLETED ?? 0 },
          { label: "Nofaol", value: "CANCELLED", count: statusCounts.CANCELLED ?? 0 },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border hover:bg-muted/50"
            }`}
          >
            {tab.label} <span className="text-xs text-muted-foreground">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {editLoading && <p className="mb-4 text-sm text-muted-foreground">Tahrirlash uchun ma'lumot yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <EntityTable
        rows={groups}
        statusOptions={GROUP_STATUS_ACTIONS}
        onView={(g) => setViewGroupId(g.id)}
        onEdit={(g) => { setEditLoading(true); groupsApi.get(g.id).then((detail) => { setEditGroup(detail); setOpen(true); }).catch((err) => setError(err.message || "Ma'lumotlarni yuklashda xatolik")).finally(() => setEditLoading(false)); }}
        onStatusChange={updateStatus}
        onDelete={deleteGroup}
        deleteTitle={(g) => `"${g.name}" guruhini o'chirish`}
        deleteDescription={() => "Ushbu guruhni o'chirishni tasdiqlaysizmi? Barcha bog'liq ma'lumotlar o'chiriladi."}
        columns={[
          { key: "name", label: "Guruh nomi", render: (g) => <button className="erp-person-cell" onClick={() => setViewGroupId(g.id)}><span className="erp-person-avatar erp-person-initials">{g.name.slice(0,2).toUpperCase()}</span><span><strong>{g.name}</strong><small>{g.course?.name || "Kurs biriktirilmagan"}</small></span></button> },
          { key: "course", label: "Kurs", render: (g) => <span>{g.course?.name || "—"}</span> },
          { key: "students", label: "O'quvchilar", render: (g) => <span>{g._count?.studentGroups || 0}/{g.maxStudent}</span> },
          { key: "start", label: "Boshlanish", render: (g) => <span>{new Date(g.startDate).toLocaleDateString("uz-UZ")}</span> },
          { key: "schedule", label: "Jadval", render: (g) => <span>{formatSchedule((g as any).schedules)}</span> },
          { key: "status", label: "Status", render: (g) => <StatusBadge status={g.status} /> },
        ]}
      />

      {!loading && groups.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Hech qanday guruh topilmadi.
        </p>
      )}

      <TablePagination
        page={page} totalPages={totalPages} total={total} limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <AdminFormDrawer
        kind="group"
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditGroup(null); }}
        onSubmit={addGroup}
        initialValues={editGroup ? {
          name: editGroup.name,
          maxStudent: String(editGroup.maxStudent),
          startDate: editGroup.startDate?.slice(0, 10) || "",
          courseId: String(editGroup.course?.id || ""),
          time: editGroup.schedules?.[0]?.startTime?.slice(0, 5) || "",
          weekDays: editGroup.schedules?.map((s) => s.weekDay).join(",") || "",
          roomId: String(editGroup.schedules?.find((s) => s.room?.id)?.room?.id || ""),
          teacherId: String(editGroup.groupTeachers?.[0]?.teacher?.user?.id || ""),
        } : undefined}
      />

      {/* View Modal */}
      <Dialog
        open={viewGroupId !== null}
        onOpenChange={(o) => { if (!o) { setViewGroupId(null); setViewGroup(null); } }}
      >
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl border border-border bg-card">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="font-heading text-lg font-bold">
              Umumiy ma'lumot
            </DialogTitle>
          </DialogHeader>

          {viewLoading && (
            <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda...</div>
          )}

          {viewGroup && (
            <div className="p-6 space-y-5">
              {/* Avatar + name + status */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl navy-gradient flex items-center justify-center text-white font-bold text-sm">
                  {viewGroup.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl">{viewGroup.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewGroup.course?.name || "—"}</p>
                </div>
                <StatusBadge status={viewGroup.status} />
              </div>

              {/* Detail rows */}
              <div className="space-y-3 text-sm">
                {[
                  { label: "Kurs", value: viewGroup.course?.name || "—" },
                  { label: "Davomiyligi", value: viewGroup.course?.durationMonth ? `${viewGroup.course.durationMonth} oy` : "—" },
                  { label: "Xona", value: getRoomName(viewGroup.schedules) },
                  { label: "Dars jadvali", value: formatSchedule(viewGroup.schedules) },
                  { label: "Boshlanish sanasi", value: viewGroup.startDate ? new Date(viewGroup.startDate).toLocaleDateString("uz-UZ") : "—" },
                  { label: "O'qituvchi", value: getTeacherName(viewGroup.groupTeachers) },
                  { label: "O'quvchilar", value: `${viewGroup.studentGroups?.length || 0}/${viewGroup.maxStudent}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="rounded-xl px-5 h-10" onClick={() => { setViewGroupId(null); setViewGroup(null); }}>
                  Yopish
                </Button>
                <Button
                  className="rounded-xl px-5 h-10 navy-gradient text-white hover:opacity-90 shadow-sm shadow-primary/20"
                  onClick={() => {
                    const id = viewGroupId;
                    setViewGroupId(null); setViewGroup(null);
                    if (id) {
                      setEditLoading(true);
                      groupsApi.get(id)
                        .then((detail) => { setEditGroup(detail); setOpen(true); })
                        .catch((err) => setError(err.message || "Ma'lumotlarni yuklashda xatolik"))
                        .finally(() => setEditLoading(false));
                    }
                  }}
                >
                  O'zgartirish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
