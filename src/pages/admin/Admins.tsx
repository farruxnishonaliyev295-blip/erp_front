import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ArrowLeft, Loader2, X, CheckCircle2 } from "lucide-react";
import PageHeader, { type FilterOption } from "@/components/ui/PageHeader";
import EntityCard, { type StatusOption as CardStatusOption } from "@/components/ui/EntityCard";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { adminsApi } from "@/api/services/adminsApi";
import { apiClient } from "@/api/apiClient";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TablePagination from "@/components/ui/TablePagination";
import EntityTable from "@/components/ui/EntityTable";
import type { User } from "@/api/types";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("uz-UZ") : "—";

const ADMIN_FILTER_OPTIONS: FilterOption[] = [
  { label: "Faol", value: "ACTIVE" },
  { label: "Nofaol", value: "INACTIVE" },
];

const ADMIN_STATUS_ACTIONS: CardStatusOption[] = [
  { value: "ACTIVE", label: "Faol", dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Nofaol", dot: "bg-slate-400" },
];

const EMPTY_FORM = { firstName: "", lastName: "", phone: "", email: "", photo: "" };

export default function Admins({ archived = false }: { archived?: boolean }) {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [newCredentials, setNewCredentials] = useState<{ login: string; password: string } | null>(null);

  const [editAdmin, setEditAdmin] = useState<User | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewAdmin, setViewAdmin] = useState<User | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (viewId === null) { setViewAdmin(null); return; }
    adminsApi.get(viewId).then(setViewAdmin).catch(() => setViewAdmin(null));
  }, [viewId]);

  const fetchAdmins = () => {
    setLoading(true);
    adminsApi
      .list({ page, limit, status: statusFilter || undefined, archived })
      .then((res) => {
        setAdmins(res.items as User[]);
        if (res.meta) { setTotal(res.meta.total); setTotalPages(res.meta.totalPages); }
      })
      .catch((err) => setError(err.message || "Adminlarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAdmins, [page, limit, statusFilter, archived]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditAdmin(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setPhotoError("");
  };

  const openCreate = () => {
    setEditAdmin(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (admin: User) => {
    setEditAdmin(admin);
    setForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      email: admin.email || "",
      photo: admin.photo || "",
    });
    setDrawerOpen(true);
  };

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Faqat JPEG, PNG yoki WEBP formatidagi rasm yuklash mumkin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Rasm hajmi 5 MB dan oshmasligi kerak.");
      return;
    }
    setPhotoUploading(true);
    try {
      const { url } = await apiClient.uploadGenericPhoto(file);
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      setPhotoError((err as { data?: { message?: string } })?.data?.message || "Rasm yuklashda xatolik.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const submitAdminForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      if (editAdmin) {
        await adminsApi.update(editAdmin.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          photo: form.photo || undefined,
        });
      } else {
        const res = await adminsApi.create({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          photo: form.photo || undefined,
        });
        if (res && res.credentials) setNewCredentials(res.credentials);
      }
      closeDrawer();
      fetchAdmins();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = (admin: User, status: string) => {
    adminsApi
      .setStatus(admin.id, status)
      .then(() => setAdmins((prev) => prev.map((a) => a.id === admin.id ? { ...a, status } : a)))
      .catch((err) => setError(err.message || "Statusni yangilashda xatolik"));
  };

  const deleteAdmin = (admin: User) => {
    adminsApi
      .remove(admin.id)
      .then(() => {
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
        setTotal((t) => Math.max(0, t - 1));
      })
      .catch((err) => setError(err.message || "O'chirishda xatolik"));
  };

  const restoreAdmin = (admin: User) => {
    adminsApi
      .restore(admin.id)
      .then(() => {
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
        setTotal((t) => Math.max(0, t - 1));
      })
      .catch((err) => setError(err.message || "Tiklashda xatolik"));
  };

  return (
    <div>
      {archived && (
        <Link to="/admin/admins" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Faol ro'yxatga qaytish
        </Link>
      )}
      <PageHeader
        title={archived ? "Adminlar arxivi" : "Adminlar"}
        subtitle={(total || admins.length) + " ta admin"}
        actionLabel={archived ? undefined : "Yangi admin"}
        onAction={openCreate}
        filterOptions={archived ? undefined : ADMIN_FILTER_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
        archiveHref={archived ? undefined : "/admin/admins/archive"}
      />

      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <EntityTable
        rows={admins}
        statusOptions={ADMIN_STATUS_ACTIONS}
        archived={archived}
        onView={(a) => setViewId(a.id)}
        onEdit={openEdit}
        onStatusChange={updateStatus}
        onDelete={deleteAdmin}
        onRestore={restoreAdmin}
        deleteTitle={(a) => `"${a.firstName} ${a.lastName}" ni ${archived ? "butunlay " : ""}o'chirish`}
        deleteDescription={(a) => archived ? "Bu admin arxivdan butunlay o'chiriladi. Bu amalni ORTGA QAYTARIB BO'LMAYDI." : "Ushbu adminni o'chirishni tasdiqlaysizmi? U arxivga o'tkaziladi."}
        columns={[
          { key: "name", label: "Ism va familiya", render: (a) => <button className="erp-person-cell" onClick={() => setViewId(a.id)}>{a.photo ? <img src={a.photo} alt="" className="erp-person-avatar" /> : <span className="erp-person-avatar erp-person-initials">{((a.firstName?.[0]||"")+(a.lastName?.[0]||"")).toUpperCase()}</span>}<span><strong>{a.firstName} {a.lastName}</strong><small>{a.email || "—"}</small></span></button> },
          { key: "phone", label: "Telefon", render: (a) => <span>{a.phone || "—"}</span> },
          { key: "email", label: "Email", render: (a) => <span>{a.email || "—"}</span> },
          { key: "role", label: "Lavozim", render: () => <span>Administrator</span> },
          { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
        ]}
      />

      {!loading && admins.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {archived ? "Arxiv bo'sh." : "Hech qanday admin topilmadi."}
        </p>
      )}

      <TablePagination
        page={page} totalPages={totalPages} total={total} limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <Sheet open={drawerOpen} onOpenChange={(o) => { if (!o) closeDrawer(); else setDrawerOpen(true); }}>
        <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[420px]">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <SheetTitle className="font-heading text-xl font-bold">
              {editAdmin ? "Adminni tahrirlash" : "Yangi admin qo'shish"}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm">
              {editAdmin
                ? "Admin ma'lumotlarini yangilang."
                : "Yangi admin uchun ma'lumotlarni kiriting. Parol avtomatik yaratiladi va birinchi kirishda almashtirilishi so'raladi."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={submitAdminForm} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <div className="space-y-2">
                <Label>Rasm (ixtiyoriy)</Label>
                {form.photo ? (
                  <div className="flex items-center gap-4">
                    <label className="group relative h-24 w-24 cursor-pointer">
                      <img
                        src={form.photo}
                        alt="Tanlangan rasm"
                        className="h-24 w-24 rounded-xl border border-border object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setForm((f) => ({ ...f, photo: "" })); }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white"
                          aria-label="Rasmni o'chirish"
                          title="Rasmni o'chirish"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoSelect} disabled={photoUploading} className="sr-only" />
                    </label>
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Rasm tanlandi
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Almashtirish uchun rasmning ustiga bosing
                      </p>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-muted/40">
                    {photoUploading ? (
                      <span className="text-xs text-muted-foreground">Yuklanmoqda...</span>
                    ) : (
                      <>
                        <span className="font-medium text-primary">Rasm yuklash</span>
                        <span className="text-xs text-muted-foreground">JPG, PNG yoki WEBP</span>
                      </>
                    )}
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoSelect} disabled={photoUploading} className="sr-only" />
                  </label>
                )}
                {photoError && <p className="text-xs text-destructive">{photoError}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ism</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Ism" className="h-11 rounded-xl bg-muted/40 border-border" required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Familiya</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Familiya" className="h-11 rounded-xl bg-muted/40 border-border" required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Telefon raqam</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998" className="h-11 rounded-xl bg-muted/40 border-border" required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Elektron pochta (ixtiyoriy)</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" className="h-11 rounded-xl bg-muted/40 border-border" />
              </div>
            </div>
            <div className="border-t border-border px-6 py-4">
              {formError && <p className="mb-2 text-sm text-destructive">{formError}</p>}
              <Button type="submit" disabled={submitting || photoUploading} className="w-full h-11 rounded-xl font-semibold navy-gradient">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : null}
                {editAdmin ? "Saqlash" : submitting ? "Saqlanmoqda..." : "Yaratish"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={viewId !== null} onOpenChange={(o) => { if (!o) setViewId(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">Admin ma'lumotlari</DialogTitle>
          </DialogHeader>
          {!viewAdmin ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Yuklanmoqda...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {viewAdmin.photo ? (
                  <img src={viewAdmin.photo} alt={viewAdmin.firstName} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {`${viewAdmin.firstName?.[0] || ""}${viewAdmin.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-heading font-bold">{viewAdmin.firstName} {viewAdmin.lastName}</p>
                  <StatusBadge status={viewAdmin.status} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Telefon", value: viewAdmin.phone || "—" },
                  { label: "Elektron pochta", value: viewAdmin.email || "—" },
                  { label: "Yaratilgan sanasi", value: formatDate(viewAdmin.createdAt) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={newCredentials !== null}
        onOpenChange={(o) => { if (!o) setNewCredentials(null); }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-2xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">Admin yaratildi</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Login va parolni adminga bering. Birinchi kirishda parolni almashtirish so'raladi.
          </p>
          <div className="mt-4 space-y-2 rounded-xl bg-muted/50 border border-border p-4 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Login:</span>
              <span className="font-semibold">{newCredentials?.login}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Parol:</span>
              <span className="font-semibold">{newCredentials?.password}</span>
            </div>
          </div>
          <Button className="mt-4 w-full h-11 rounded-xl navy-gradient" onClick={() => setNewCredentials(null)}>Yopish</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}