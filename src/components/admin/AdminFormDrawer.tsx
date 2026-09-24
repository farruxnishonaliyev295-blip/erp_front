import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, Plus, Search, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/api/apiClient";

export type AdminDrawerKind = "course" | "room" | "teacher" | "student" | "group";

type AdminFormDrawerProps = {
  kind: AdminDrawerKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  initialValues?: Record<string, string>;
};

const drawerContent = {
  course: {
    addTitle: "Kurs qo'shish", editTitle: "Kursni tahrirlash",
    description: "Bu yerda siz yangi kurs qo'shishingiz mumkin.",
  },
  room: {
    addTitle: "Xonani qo'shish", editTitle: "Xonani tahrirlash",
    description: "Yangi xona yaratish uchun quyidagi ma'lumotlarni kiriting.",
  },
  teacher: {
    addTitle: "O'qituvchi qo'shish", editTitle: "O'qituvchini tahrirlash",
    description: "Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.",
  },
  student: {
    addTitle: "Talaba qo'shish", editTitle: "Talabani tahrirlash",
    description: "Yangi talabani ro'yxatdan o'tkazish uchun ma'lumotlarni kiriting.",
  },
  group: {
    addTitle: "Guruh qo'shish", editTitle: "Guruhni tahrirlash",
    description: "Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.",
  },
};

export default function AdminFormDrawer({ kind, open, onOpenChange, onSubmit, initialValues }: AdminFormDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const content = drawerContent[kind];
  const isEdit = Boolean(initialValues && Object.keys(initialValues).length > 0);

  // initialValues o'zgarganda yoki drawer ochilganda maydonlarni to'ldirish
  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setSubmitError("");
    }
  }, [open, initialValues]);

  const update = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
      onOpenChange(false);
      setValues({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="font-heading text-xl font-bold">
            {isEdit ? content.editTitle : content.addTitle}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">{content.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {kind === "course" && <>
              <Field label="Nomi" name="name" placeholder="Kurs nomi" values={values} update={update} required />
              <Field label="Dars davomiyligi" name="durationHours" placeholder="Masalan: 60" values={values} update={update} type="number" required />
              <Field label="Kurs davomiyligi (oylarda)" name="durationMonth" placeholder="Masalan: 6" values={values} update={update} type="number" required />
              <Field label="Narx" name="price" placeholder="Narxni kiriting" values={values} update={update} type="number" required />
              <TextArea label="Description" name="description" placeholder="Kurs haqida qisqacha ma'lumot" values={values} update={update} />
            </>}
            {kind === "room" && <>
              <Field label="Nomi" name="name" placeholder="Xona nomi" values={values} update={update} required />
              <Field label="Sig'imi" name="capacity" placeholder="Masalan: 20" values={values} update={update} type="number" required />
            </>}
            {kind === "teacher" && <>
              <Field label="Telefon raqam" name="phone" placeholder="+998" values={values} update={update} required />
              <Field label="Elektron pochta (ixtiyoriy)" name="email" placeholder="Elektron pochtani kiriting" values={values} update={update} type="email" />
              <Field label="Ismi" name="firstName" placeholder="Ismini kiriting" values={values} update={update} required />
              <Field label="Familiyasi" name="lastName" placeholder="Familiyasini kiriting" values={values} update={update} required />
              <EntityPickerField label="Guruhlar (ixtiyoriy)" name="groupIds" entity="groups" multiple={true} values={values} update={update} />
              <ImageField values={values} update={update} />
              <Field label="Manzil" name="address" placeholder="Manzilni kiriting" values={values} update={update} />
              <Field label={isEdit ? "Yangi parol (ixtiyoriy)" : "Parol"} name="password" placeholder="Parolni kiriting" values={values} update={update} type="password" required={!isEdit} />
            </>}
            {kind === "student" && <>
              <Field label="Telefon raqam" name="phone" placeholder="+998901234567" values={values} update={update} required disabled={isEdit} />
              <Field label="Elektron pochta (ixtiyoriy)" name="email" placeholder="Elektron pochtani kiriting" values={values} update={update} type="email" />
              <Field label="Ismi" name="firstName" placeholder="Ismini kiriting" values={values} update={update} required />
              <Field label="Familiyasi" name="lastName" placeholder="Familiyasini kiriting" values={values} update={update} required />
              <Field label="Tug'ilgan sana (ixtiyoriy)" name="birthDate" placeholder="dd/mm/yyyy" values={values} update={update} type="date" />
              <Field label="Ota-ona telefoni (ixtiyoriy)" name="parentPhone" placeholder="+998901234567" values={values} update={update} />
              <Field label="Manzil (ixtiyoriy)" name="address" placeholder="Manzilni kiriting" values={values} update={update} />
              <Field label="Parol (ixtiyoriy)" name="password" placeholder="Parolni kiriting yoki avtomatik beriladi" values={values} update={update} type="password" />
              <EntityPickerField label="Guruhlar (ixtiyoriy)" name="groupIds" entity="groups" multiple={true} values={values} update={update} />
              <ImageField values={values} update={update} />
            </>}
            {kind === "group" && <>
              <Field label="Guruh nomi" name="name" placeholder="Frontend 2024" values={values} update={update} required />
              <EntityPickerField label="Kurs" name="courseId" entity="courses" multiple={false} values={values} update={update} required />
              <EntityPickerField label="Xona (ixtiyoriy)" name="roomId" entity="rooms" multiple={false} values={values} update={update} />
              <EntityPickerField label="O'qituvchi (ixtiyoriy)" name="teacherIds" entity="teachers" multiple={true} values={values} update={update} />
              <EntityPickerField label="Talabalar (ixtiyoriy)" name="studentIds" entity="students" multiple values={values} update={update} />
              <Field label="Maksimal talabalar soni" name="maxStudent" placeholder="Masalan: 20" values={values} update={update} type="number" required />
              <DaysField values={values} update={update} />
              <TimeField values={values} update={update} required />
              <DateField label="Boshlanish sanasi" name="startDate" values={values} update={update} required />
              <TextArea label="Tavsif" name="description" placeholder="Guruh haqida qo'shimcha ma'lumot" values={values} update={update} />
            </>}
          </div>
          {submitError && <p className="px-6 pb-3 text-sm text-destructive">{submitError}</p>}
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Bekor qilish</Button><Button type="submit" className="accent-gradient text-white hover:opacity-90" disabled={isSubmitting}><Plus />{isSubmitting ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FieldProps = { label: string; name: string; placeholder: string; values: Record<string, string>; update: (name: string, value: string) => void; type?: string; required?: boolean; disabled?: boolean };
function Field({ label, name, placeholder, values, update, type = "text", required, disabled }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`admin-${name}`}>
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={`admin-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        value={values[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

function TextArea({ label, name, placeholder, values, update }: Omit<FieldProps, "type" | "required">) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`admin-${name}`}>{label}</Label>
      <textarea
        id={`admin-${name}`}
        name={name}
        placeholder={placeholder}
        value={values[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

// Oddiy HTML date input — eng ishonchli yechim
function DateField({
  label, name, values, update, required,
}: {
  label: string; name: string; values: Record<string, string>;
  update: (name: string, value: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`admin-${name}`}>
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          id={`admin-${name}`}
          type="date"
          required={required}
          value={values[name] || ""}
          onChange={(e) => update(name, e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
    </div>
  );
}

function TimeField({
  values, update, required,
}: {
  values: Record<string, string>;
  update: (name: string, value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="admin-time">
        Dars vaqti{required && <span className="text-destructive"> *</span>}
      </Label>
      <input
        id="admin-time"
        type="time"
        required={required}
        value={values.time || ""}
        onChange={(e) => update("time", e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
      />
      {values.time && (
        <p className="text-xs text-muted-foreground">
          Tanlangan vaqt: <span className="font-semibold text-foreground">{values.time}</span>
        </p>
      )}
    </div>
  );
}

type Entity = "groups" | "courses" | "rooms" | "teachers" | "students";
type PickerOption = { id: string; label: string };

function EntityPickerField({
  label, name, entity, multiple, values, update, required,
}: {
  label: string; name: string; entity: Entity; multiple: boolean;
  values: Record<string, string>; update: (name: string, value: string) => void; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PickerOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const selectedIds = values[name] ? values[name].split(",").filter(Boolean) : [];
  const selectedLabels = selectedIds.map(
    (id) => options.find((o) => o.id === id)?.label || id
  );

  const load = async () => {
    setOpen(true);
    if (options.length) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await apiClient.request<{ items: Array<Record<string, unknown>> }>(
        `/${entity}?limit=100`
      );
      setOptions(
        res.items.map((item) => ({
          id: String(
            entity === "teachers"
              ? (item.teacherProfile as { id?: number } | undefined)?.id ?? item.id
              : item.id
          ),
          label:
            entity === "teachers" || entity === "students"
              ? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()
              : String(item.name ?? ""),
        }))
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    const next = multiple
      ? selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id]
      : [id];
    update(name, next.join(","));
    if (!multiple) setOpen(false);
  };

  const remove = (id: string) => {
    update(name, selectedIds.filter((v) => v !== id).join(","));
  };

  const clearAll = () => update(name, "");

  const visible = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>

      {/* Tanlangan narsalar (chip ko'rinishida) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const lbl = options.find((o) => o.id === id)?.label || id;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium"
              >
                {lbl}
                <button
                  type="button"
                  aria-label={`${lbl} ni olib tashlash`}
                  onClick={() => remove(id)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  ×
                </button>
              </span>
            );
          })}
          {multiple && selectedIds.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive underline"
            >
              Barchasini olib tashlash
            </button>
          )}
        </div>
      )}

      {/* Ochish tugmasi */}
      <button
        type="button"
        onClick={load}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm hover:bg-muted/50"
      >
        <span className="text-muted-foreground">
          {selectedIds.length === 0
            ? "Tanlash uchun bosing..."
            : multiple
            ? `${selectedIds.length} ta tanlangan (o'zgartirish)`
            : "O'zgartirish"}
        </span>
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </button>

      {/* Picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col sm:max-w-md p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
            <DialogTitle className="font-heading font-bold">{label}</DialogTitle>
          </DialogHeader>

          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                placeholder="Qidirish..."
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Yuklanmoqda...</p>
            ) : loadError ? (
              <p className="py-6 text-center text-sm text-destructive">{loadError}</p>
            ) : visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Topilmadi.</p>
            ) : (
              <div className="space-y-0.5">
                {visible.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        isSelected
                          ? "bg-accent/10 text-accent font-medium"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={name}
                        checked={isSelected}
                        onChange={() => toggle(opt.id)}
                        className="accent-[hsl(var(--accent))]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {multiple && (
            <div className="px-4 py-3 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{selectedIds.length} ta tanlangan</span>
              <Button size="sm" className="rounded-xl" onClick={() => setOpen(false)}>
                Tasdiqlash
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DaysField({
  values, update,
}: {
  values: Record<string, string>;
  update: (name: string, value: string) => void;
}) {
  const days = [
    { key: "MONDAY", label: "Dushanba" },
    { key: "TUESDAY", label: "Seshanba" },
    { key: "WEDNESDAY", label: "Chorshanba" },
    { key: "THURSDAY", label: "Payshanba" },
    { key: "FRIDAY", label: "Juma" },
    { key: "SATURDAY", label: "Shanba" },
    { key: "SUNDAY", label: "Yakshanba" },
  ];
  const selected = values.weekDays ? values.weekDays.split(",").filter(Boolean) : [];

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((d) => d !== key)
      : [...selected, key];
    update("weekDays", next.join(","));
  };

  return (
    <div className="space-y-2">
      <Label>
        Dars kunlari <span className="text-destructive">*</span>
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {days.map(({ key, label }) => {
          const isActive = selected.includes(key);
          return (
            <label
              key={key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-accent font-medium"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggle(key)}
                className="accent-[hsl(var(--accent))]"
              />
              {label}
            </label>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Tanlangan: <span className="font-medium text-foreground">{selected.length} kun</span>
        </p>
      )}
    </div>
  );
}

function ImageField({
  values, update,
}: {
  values: Record<string, string>;
  update: (name: string, value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Faqat JPEG, PNG yoki WEBP formatidagi rasm yuklash mumkin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Rasm hajmi 5 MB dan oshmasligi kerak.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await apiClient.uploadGenericPhoto(file);
      update("photo", url);
    } catch (err) {
      setUploadError(
        (err as { data?: { message?: string } })?.data?.message ||
        "Rasm yuklashda xatolik yuz berdi. Qayta urinib ko'ring.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Rasm (ixtiyoriy)</Label>

      {values.photo ? (
        // Rasm tanlangan holat — katta, aniq preview + ustiga olib borilganda
        // chiqadigan "x" tugmasi (rasmning o'zini bosish ham almashtiradi).
        <div className="flex items-center gap-4">
          <label className="group relative h-24 w-24 cursor-pointer">
            <img
              src={values.photo}
              alt="Tanlangan rasm"
              className="h-24 w-24 rounded-xl border border-border object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); update("photo", ""); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white"
                aria-label="Rasmni o'chirish"
                title="Rasmni o'chirish"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onChange}
              disabled={uploading}
              className="sr-only"
            />
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
        // Hali rasm tanlanmagan holat
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-muted/40">
          {uploading ? (
            <span className="text-xs text-muted-foreground">Yuklanmoqda...</span>
          ) : (
            <>
              <span className="font-medium text-primary">Rasm yuklash</span>
              <span className="text-xs text-muted-foreground">JPG, PNG yoki WEBP</span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      )}

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
    </div>
  );
}
