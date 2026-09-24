import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, CreditCard, ArrowLeft, Eye, Pencil, Trash2, MoreHorizontal, UsersRound, RotateCcw } from "lucide-react";
import PageHeader, { type FilterOption } from "@/components/ui/PageHeader";
import { type StatusOption as CardStatusOption } from "@/components/ui/EntityCard";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { studentsApi } from "@/api/services/studentsApi";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/ui/TablePagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  status: string;
  photo?: string | null;
  address?: string | null;
  createdAt?: string;
  studentProfile?: {
    birthDate?: string | null;
    parentPhone?: string | null;
    balance?: number | string;
    studentGroups?: Array<{ group?: { name: string } }>;
  };
};

const STUDENT_FILTER_OPTIONS: FilterOption[] = [
  { label: "Faol", value: "ACTIVE" },
  { label: "Nofaol", value: "INACTIVE" },
  { label: "Muzlatilgan", value: "FREEZE" },
  { label: "Bitirgan", value: "GRADUATED" },
];

const STUDENT_STATUS_ACTIONS: CardStatusOption[] = [
  { value: "ACTIVE", label: "Faol", dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Nofaol", dot: "bg-slate-400" },
  { value: "FREEZE", label: "Muzlatilgan", dot: "bg-amber-500" },
  { value: "GRADUATED", label: "Bitirgan", dot: "bg-accent" },
];

const formatMoney = (v: number | string) =>
  `${Number(v).toLocaleString("uz-UZ")} so'm`;

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
};

export default function Students({ archived = false }: { archived?: boolean }) {
  const [open, setOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCredentials, setNewCredentials] = useState<{ login: string; password: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  const fetchStudents = () => {
    setLoading(true);
    studentsApi
      .list({ page, limit, status: statusFilter || undefined, archived })
      .then((res) => {
        setStudents(res.items as Student[]);
        if (res.meta) { setTotal(res.meta.total); setTotalPages(res.meta.totalPages); }
      })
      .catch((err) => setError(err.message || "Talabalarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchStudents, [page, limit, statusFilter, archived]);

  useEffect(() => {
    if (!viewId) return;
    setViewLoading(true);
    setViewStudent(null);
    studentsApi.get(viewId)
      .then((res) => setViewStudent(res as Student))
      .catch(() => {})
      .finally(() => setViewLoading(false));
  }, [viewId]);

  const addStudent = async (values: Record<string, string>) => {
    setError("");
    if (editStudent) {
      // values.photo bo'sh bo'lsa, editStudent'dagi rasmni saqlab qolamiz
      const photoUrl = values.photo?.trim() || editStudent.photo || undefined;

      await studentsApi.update(editStudent.id, {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        email: values.email?.trim() || undefined,
        address: values.address?.trim() || undefined,
        photo: photoUrl,
        birthDate: values.birthDate || undefined,
        parentPhone: values.parentPhone?.trim() || undefined,
      });

      fetchStudents();
      setEditStudent(null);
      setOpen(false);
      return;
    }

    const res = await studentsApi.create({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email?.trim() || undefined,
      birthDate: values.birthDate || undefined,
      parentPhone: values.parentPhone?.trim() || undefined,
      address: values.address?.trim() || undefined,
      photo: values.photo?.trim() || undefined,
      groupIds: values.groupIds
        ? values.groupIds.split(",").filter(Boolean)
        : undefined,
      password: values.password?.trim() || undefined,
    });

    fetchStudents();
    setNewCredentials(res.credentials);
  };

  const updateStatus = (student: Student, status: string) => {
    studentsApi
      .update(student.id, { status })
      .then(() => setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, status } : s)))
      .catch((err) => setError(err.message || "Statusni yangilashda xatolik"));
  };

  const deleteStudent = (student: Student) => {
    studentsApi
      .remove(student.id)
      .then(fetchStudents)
      .catch((err) => setError(err.message || "Talabani o'chirishda xatolik"));
  };

  const restoreStudent = (student: Student) => {
    studentsApi
      .restore(student.id)
      .then(fetchStudents)
      .catch((err) => setError(err.message || "Talabani tiklashda xatolik"));
  };

  return (
    <div>
      {archived && (
        <Link to="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Faol ro'yxatga qaytish
        </Link>
      )}
      <PageHeader
        title={archived ? "Talabalar arxivi" : "Talabalar"}
        subtitle={`${total || students.length} ta talaba`}
        actionLabel={archived ? undefined : "Yangi talaba"}
        onAction={() => setOpen(true)}
        filterOptions={archived ? undefined : STUDENT_FILTER_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
        archiveHref={archived ? undefined : "/admin/students/archive"}
      />

      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="erp-table-shell">
        <div className="erp-table-scroll">
          <table className="erp-students-table w-full">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="erp-checkbox" /></th>
                <th>Ism va familiya</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Guruh</th>
                <th>Status</th>
                <th>Balans</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const group = student.studentProfile?.studentGroups?.[0]?.group?.name || "—";
                const balance = Number(student.studentProfile?.balance || 0);
                const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <tr key={student.id}>
                    <td><input type="checkbox" className="erp-checkbox" /></td>
                    <td>
                      <button className="erp-person-cell" onClick={() => setViewId(student.id)}>
                        {student.photo ? <img src={student.photo} alt="" className="erp-person-avatar" /> : <span className="erp-person-avatar erp-person-initials">{initials}</span>}
                        <span><strong>{student.firstName} {student.lastName}</strong><small>ID: #{String(student.id).padStart(3, "0")}</small></span>
                      </button>
                    </td>
                    <td><span className="erp-data-with-icon"><Phone className="w-4 h-4" />{student.phone || "—"}</span></td>
                    <td><span className="erp-data-with-icon"><Mail className="w-4 h-4" />{student.email || "—"}</span></td>
                    <td><span className="erp-data-with-icon"><UsersRound className="w-4 h-4" />{group}</span></td>
                    <td><StatusBadge status={student.status} /></td>
                    <td><strong className={balance > 0 ? "text-amber-600" : "text-emerald-600"}>{balance > 0 ? formatMoney(balance) : "0 so'm"}</strong></td>
                    <td>
                      <div className="erp-row-actions">
                        <button title="Ko'rish" onClick={() => setViewId(student.id)} className="erp-action-btn erp-action-view"><Eye className="w-4 h-4" /></button>
                        {!archived && <button title="Tahrirlash" onClick={() => { setEditStudent(student); setOpen(true); }} className="erp-action-btn erp-action-edit"><Pencil className="w-4 h-4" /></button>}
                        {!archived && <DropdownMenu>
                          <DropdownMenuTrigger asChild><button title="Status" className="erp-action-btn"><MoreHorizontal className="w-4 h-4" /></button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-1.5 min-w-[180px]">
                            {STUDENT_STATUS_ACTIONS.map((opt) => <DropdownMenuItem key={opt.value} onClick={() => updateStatus(student, opt.value)} className="rounded-lg cursor-pointer"><span className={`w-2 h-2 rounded-full mr-2 ${opt.dot}`} />{opt.label}</DropdownMenuItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>}
                        {archived && <button title="Tiklash" onClick={() => restoreStudent(student)} className="erp-action-btn erp-action-view"><RotateCcw className="w-4 h-4" /></button>}
                        <button title={archived ? "Butunlay o'chirish" : "O'chirish"} onClick={() => deleteStudent(student)} className="erp-action-btn erp-action-delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && students.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {archived ? "Arxiv bo'sh." : "Hech qanday talaba topilmadi."}
        </p>
      )}

      <TablePagination
        page={page} totalPages={totalPages} total={total} limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <AdminFormDrawer
        kind="student"
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditStudent(null); }}
        onSubmit={addStudent}
        initialValues={editStudent ? {
          firstName: editStudent.firstName,
          lastName: editStudent.lastName,
          phone: editStudent.phone,
          email: editStudent.email || "",
          address: editStudent.address || "",
          birthDate: editStudent.studentProfile?.birthDate?.slice(0, 10) || "",
          parentPhone: editStudent.studentProfile?.parentPhone || "",
          photo: editStudent.photo || "",
        } : undefined}
      />

      {/* View Modal */}
      <Dialog
        open={viewId !== null}
        onOpenChange={(o) => { if (!o) { setViewId(null); setViewStudent(null); } }}
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

          {viewStudent && (
            <div className="p-6 space-y-5">
              {/* Avatar + name + status */}
              <div className="flex items-center gap-4">
                {viewStudent.photo ? (
                  <img src={viewStudent.photo} alt={viewStudent.firstName} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {`${viewStudent.firstName?.[0] || ""}${viewStudent.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl">
                    {viewStudent.firstName} {viewStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {viewStudent.studentProfile?.studentGroups?.[0]?.group?.name || "Guruh biriktirilmagan"}
                  </p>
                </div>
                <StatusBadge status={viewStudent.status} />
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: "Elektron pochta", value: viewStudent.email || "—" },
                  { label: "Telefon", value: viewStudent.phone || "—" },
                  { label: "Tug'ilgan sanasi", value: formatDate(viewStudent.studentProfile?.birthDate) },
                  { label: "Manzil", value: viewStudent.address || "—" },
                  { label: "Yaratilgan sanasi", value: formatDate(viewStudent.createdAt) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="rounded-xl px-5 h-10" onClick={() => { setViewId(null); setViewStudent(null); }}>
                  Yopish
                </Button>
                <Button
                  className="rounded-xl px-5 h-10 navy-gradient text-white hover:opacity-90 shadow-sm shadow-primary/20"
                  onClick={() => {
                    const s = viewStudent;
                    setViewId(null); setViewStudent(null);
                    if (s) setEditStudent(s);
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

      {/* Credentials Dialog */}
      <Dialog open={!!newCredentials} onOpenChange={(o) => !o && setNewCredentials(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              Talaba muvaffaqiyatli qo'shildi
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Quyidagi login va parolni talabaga taqdim eting.
          </p>
          {newCredentials && (
            <div className="space-y-2 rounded-xl bg-muted p-4 text-sm">
              <p><span className="text-muted-foreground">Login:</span> <strong>{newCredentials.login}</strong></p>
              <p><span className="text-muted-foreground">Parol:</span> <strong>{newCredentials.password}</strong></p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
