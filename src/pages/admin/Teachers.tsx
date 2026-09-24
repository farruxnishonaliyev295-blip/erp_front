import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Briefcase, Users2, DollarSign, ArrowLeft } from "lucide-react";
import PageHeader, { type FilterOption } from "@/components/ui/PageHeader";
import EntityCard, { type StatusOption as CardStatusOption } from "@/components/ui/EntityCard";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { teachersApi } from "@/api/services/teachersApi";
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
import type { User } from "@/api/types";

type Teacher = User & {
  teacherProfile?: {
    specialty?: string | null;
    salaryType?: string;
    salaryAmount?: number | string;
    _count?: { groupTeachers: number };
  };
};

const TEACHER_FILTER_OPTIONS: FilterOption[] = [
  { label: "Faol", value: "ACTIVE" },
  { label: "Nofaol", value: "INACTIVE" },
];

const TEACHER_STATUS_ACTIONS: CardStatusOption[] = [
  { value: "ACTIVE", label: "Faol", dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Nofaol", dot: "bg-slate-400" },
];

const formatMoney = (v: number | string) => `${Number(v).toLocaleString("uz-UZ")} so'm`;
const SALARY_LABEL: Record<string, string> = {
  FIXED: "Belgilangan",
  PERCENTAGE: "Foiz",
  HOURLY: "Soatlik",
};

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
};

export default function Teachers({ archived = false }: { archived?: boolean }) {
  const [open, setOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchTeachers = () => {
    setLoading(true);
    teachersApi
      .list({ page, limit, status: statusFilter || undefined, archived })
      .then((res) => {
        setTeachers(res.items as Teacher[]);
        if (res.meta) { setTotal(res.meta.total); setTotalPages(res.meta.totalPages); }
      })
      .catch((err) => setError(err.message || "O'qituvchilarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchTeachers, [page, limit, statusFilter, archived]);

  useEffect(() => {
    if (!viewId) return;
    setViewLoading(true);
    setViewTeacher(null);
    teachersApi.get(viewId)
      .then((res) => setViewTeacher(res as Teacher))
      .catch(() => {})
      .finally(() => setViewLoading(false));
  }, [viewId]);

  const addTeacher = async (values: Record<string, string>) => {
    setError("");
    if (editTeacher) {
      await teachersApi.update(editTeacher.id, {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim() || undefined,
        address: values.address?.trim() || undefined,
        photo: values.photo || undefined,
      });
      fetchTeachers();
      setEditTeacher(null);
      return;
    }
    const res = await teachersApi.create({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      password: values.password,
      email: values.email?.trim() || undefined,
      address: values.address?.trim() || undefined,
      photo: values.photo || undefined,
      groupIds: values.groupIds
        ? values.groupIds.split(",").filter(Boolean)
        : undefined,
    });
    setTeachers((prev) => [res.user as Teacher, ...prev]);
  };

  const updateStatus = (teacher: Teacher, status: string) => {
    teachersApi
      .update(teacher.id, { status })
      .then(() => setTeachers((prev) => prev.map((t) => t.id === teacher.id ? { ...t, status } : t)))
      .catch((err) => setError(err.message || "Statusni yangilashda xatolik"));
  };

  const deleteTeacher = (teacher: Teacher) => {
    teachersApi
      .remove(teacher.id)
      .then(fetchTeachers)
      .catch((err) => setError(err.message || "O'qituvchini o'chirishda xatolik"));
  };

  const restoreTeacher = (teacher: Teacher) => {
    teachersApi
      .restore(teacher.id)
      .then(fetchTeachers)
      .catch((err) => setError(err.message || "O'qituvchini tiklashda xatolik"));
  };

  return (
    <div>
      {archived && (
        <Link to="/admin/teachers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Faol ro'yxatga qaytish
        </Link>
      )}
      <PageHeader
        title={archived ? "O'qituvchilar arxivi" : "O'qituvchilar"}
        subtitle={`${total || teachers.length} ta o'qituvchi`}
        actionLabel={archived ? undefined : "Yangi o'qituvchi"}
        onAction={() => setOpen(true)}
        filterOptions={archived ? undefined : TEACHER_FILTER_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
        archiveHref={archived ? undefined : "/admin/teachers/archive"}
      />

      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <EntityTable
        rows={teachers}
        statusOptions={TEACHER_STATUS_ACTIONS}
        archived={archived}
        onView={(t) => setViewId(t.id)}
        onEdit={(t) => { setEditTeacher(t); setOpen(true); }}
        onStatusChange={updateStatus}
        onDelete={deleteTeacher}
        onRestore={restoreTeacher}
        deleteTitle={(t) => `"${t.firstName} ${t.lastName}" ni ${archived ? "butunlay " : ""}o'chirish`}
        deleteDescription={(t) => archived ? "Bu o'qituvchi arxivdan butunlay o'chiriladi. Bu amalni ORTGA QAYTARIB BO'LMAYDI." : "Ushbu o'qituvchini o'chirishni tasdiqlaysizmi? U arxivga o'tkaziladi."}
        columns={[
          { key: "name", label: "Ism va familiya", render: (t) => <button className="erp-person-cell" onClick={() => setViewId(t.id)}>{t.photo ? <img src={t.photo as string} alt="" className="erp-person-avatar" /> : <span className="erp-person-avatar erp-person-initials">{`${t.firstName?.[0] || ""}${t.lastName?.[0] || ""}`.toUpperCase()}</span>}<span><strong>{t.firstName} {t.lastName}</strong><small>{t.teacherProfile?.specialty || "O'qituvchi"}</small></span></button> },
          { key: "phone", label: "Telefon", render: (t) => <span className="erp-data-with-icon"><Phone className="w-4 h-4" />{t.phone || "—"}</span> },
          { key: "email", label: "Email", render: (t) => <span>{t.email || "—"}</span> },
          { key: "groups", label: "Guruhlar", render: (t) => <span>{t.teacherProfile?._count?.groupTeachers || 0} ta</span> },
          { key: "salary", label: "Maosh", render: (t) => { const type=t.teacherProfile?.salaryType||"FIXED"; const value=t.teacherProfile?.salaryAmount||0; return <span className="font-semibold text-foreground">{type === "PERCENTAGE" ? `${value}%` : formatMoney(value)}</span>; } },
          { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />

      {!loading && teachers.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {archived ? "Arxiv bo'sh." : "Hech qanday o'qituvchi topilmadi."}
        </p>
      )}

      <TablePagination
        page={page} totalPages={totalPages} total={total} limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <AdminFormDrawer
        kind="teacher"
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditTeacher(null); }}
        onSubmit={addTeacher}
        initialValues={editTeacher ? {
          firstName: editTeacher.firstName,
          lastName: editTeacher.lastName,
          phone: editTeacher.phone,
          email: editTeacher.email || "",
          address: (editTeacher as any).address || "",
          photo: (editTeacher as any).photo || "",
        } : undefined}
      />

      {/* View Modal */}
      <Dialog
        open={viewId !== null}
        onOpenChange={(o) => { if (!o) { setViewId(null); setViewTeacher(null); } }}
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

          {viewTeacher && (
            <div className="p-6 space-y-5">
              {/* Avatar + name + status */}
              <div className="flex items-center gap-4">
                {viewTeacher.photo ? (
                  <img src={viewTeacher.photo as string} alt={viewTeacher.firstName} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl navy-gradient flex items-center justify-center text-white font-bold text-xl">
                    {`${viewTeacher.firstName?.[0] || ""}${viewTeacher.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl">
                    {viewTeacher.firstName} {viewTeacher.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {(viewTeacher.teacherProfile as any)?.specialty || "O'qituvchi"}
                  </p>
                </div>
                <StatusBadge status={viewTeacher.status} />
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: "Telefon", value: viewTeacher.phone || "—" },
                  { label: "Elektron pochta", value: viewTeacher.email || "—" },
                  {
                    label: "Mutaxassislik",
                    value: (viewTeacher.teacherProfile as any)?.specialty || "—",
                  },
                  {
                    label: "Guruhlar soni",
                    value: `${(viewTeacher.teacherProfile as any)?._count?.groupTeachers || 0} ta`,
                  },
                  {
                    label: "Maosh turi",
                    value: SALARY_LABEL[(viewTeacher.teacherProfile as any)?.salaryType || "FIXED"],
                  },
                  {
                    label: "Maosh",
                    value: (viewTeacher.teacherProfile as any)?.salaryType === "PERCENTAGE"
                      ? `${(viewTeacher.teacherProfile as any)?.salaryAmount || 0}%`
                      : formatMoney((viewTeacher.teacherProfile as any)?.salaryAmount || 0),
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="rounded-xl px-5 h-10" onClick={() => { setViewId(null); setViewTeacher(null); }}>
                  Yopish
                </Button>
                <Button
                  className="rounded-xl px-5 h-10 navy-gradient text-white hover:opacity-90 shadow-sm shadow-primary/20"
                  onClick={() => {
                    const t = viewTeacher;
                    setViewId(null); setViewTeacher(null);
                    if (t) setEditTeacher(t);
                    setOpen(true);
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
