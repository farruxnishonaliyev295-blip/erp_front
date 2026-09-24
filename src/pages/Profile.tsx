import React, { useRef, useState } from "react";
import { Camera, Save, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { profileApi } from "@/api/services/profileApi";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB — backend ham shu chegarani qo'yadi

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setSaved(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // xuddi shu faylni qayta tanlasa ham onChange ishlashi uchun
    if (!file) return;

    setPhotoError("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Faqat JPEG, PNG yoki WEBP formatidagi rasm yuklash mumkin.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Rasm hajmi 5 MB dan oshmasligi kerak.");
      return;
    }

    setPhotoUploading(true);
    try {
      await profileApi.uploadPhoto(file);
      await refreshUser(); // yangi rasmni serverdan qayta olib kelish uchun
    } catch (err) {
      setPhotoError(
        err?.data?.message || "Rasm yuklashda xatolik yuz berdi. Qayta urinib ko'ring.",
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await profileApi.updateMe(form);
      await refreshUser(); // header/profil holatini yangi ma'lumot bilan yangilash
      setSaved(true);
    } catch (err) {
      setSaveError(err?.data?.message || "Ma'lumotlarni saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const [pwSaving, setPwSaving] = useState(false);

  const savePassword = async (e) => {
    e.preventDefault();
    if (!pw.current) return setPwMsg({ type: "error", text: "Joriy parolni kiriting." });
    if (pw.next.length < 6) return setPwMsg({ type: "error", text: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak." });
    if (pw.next !== pw.confirm) return setPwMsg({ type: "error", text: "Yangi parollar mos kelmadi." });

    setPwSaving(true);
    try {
      await profileApi.changePassword(pw.current, pw.next);
      setPwMsg({ type: "success", text: "Parol muvaffaqiyatli yangilandi." });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err?.data?.message || "Parolni yangilashda xatolik yuz berdi.",
      });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6 items-start">
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <div className="relative w-24 h-24 mx-auto">
          {user?.photo ? (
            <img
              src={user.photo}
              alt={`${form.firstName} ${form.lastName}`}
              className="w-24 h-24 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl navy-gradient flex items-center justify-center text-white text-2xl font-heading font-bold">
              {form.firstName[0]}{form.lastName[0]}
            </div>
          )}
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={photoUploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl accent-gradient text-white flex items-center justify-center shadow-lg disabled:opacity-60"
            aria-label="Profil rasmini o'zgartirish"
          >
            {photoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handlePhotoSelect}
          />
        </div>
        {photoError && (
          <p className="mt-3 text-xs text-red-500">{photoError}</p>
        )}
        <p className="mt-4 font-heading font-bold text-lg">{form.firstName} {form.lastName}</p>
        <p className="text-sm text-muted-foreground">{user?.role || "Foydalanuvchi"}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Shaxsiy ma'lumotlar</TabsTrigger>
            <TabsTrigger value="password">Parolni yangilash</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            {saved && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />Ma'lumotlar saqlandi.
              </div>
            )}
            {saveError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />{saveError}
              </div>
            )}
            <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-first">Ism</Label>
                <Input id="p-first" value={form.firstName} onChange={update("firstName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-last">Familiya</Label>
                <Input id="p-last" value={form.lastName} onChange={update("lastName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-email">Email</Label>
                <Input id="p-email" type="email" value={form.email} onChange={update("email")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-phone">Telefon</Label>
                <Input id="p-phone" value={form.phone} onChange={update("phone")} required />
              </div>
              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={saving} className="navy-gradient hover:opacity-90">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Saqlash
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            {pwMsg && (
              <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${pwMsg.type === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                {pwMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={savePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pw-current">Joriy parol</Label>
                <Input id="pw-current" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-next">Yangi parol</Label>
                <Input id="pw-next" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm">Yangi parolni tasdiqlang</Label>
                <Input id="pw-confirm" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
              </div>
              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={pwSaving} className="navy-gradient hover:opacity-90">
                  {pwSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  Parolni yangilash
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}