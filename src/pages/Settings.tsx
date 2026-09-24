import React, { useState } from "react";
import { Save, Globe, Bell, ShieldCheck, CheckCircle2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

function ToggleRow({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const canEditSystemSettings = user?.role === "SUPERADMIN";
  const [general, setGeneral] = useState({ name: "Learnix Ta'lim Markazi", language: "O'zbek", currency: "UZS (so'm)", timezone: "Asia/Tashkent (UTC+5)" });
  const [notif, setNotif] = useState({ email: true, push: true, lessons: true, payments: true, news: false });
  const [security, setSecurity] = useState({ twoFactor: false, sessions: true });
  const [saved, setSaved] = useState(false);

  const setField = (key) => (e) => {
    setGeneral({ ...general, [key]: e.target.value });
    setSaved(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />Sozlamalar saqlandi.
        </div>
      )}

      {isAdmin && <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Globe className="w-5 h-5" /></div>
          <div>
            <h3 className="font-heading font-bold">Tizim parametrlari</h3>
            <p className="text-xs text-muted-foreground">Markaz ma'lumotlari va lokalizatsiya</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-name">Markaz nomi</Label>
            <Input id="s-name" value={general.name} onChange={setField("name")} disabled={!canEditSystemSettings} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-lang">Til</Label>
            <Input id="s-lang" value={general.language} onChange={setField("language")} disabled={!canEditSystemSettings} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-currency">Valyuta</Label>
            <Input id="s-currency" value={general.currency} onChange={setField("currency")} disabled={!canEditSystemSettings} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-tz">Vaqt zonasi</Label>
            <Input id="s-tz" value={general.timezone} onChange={setField("timezone")} disabled={!canEditSystemSettings} />
          </div>
        </div>
        <div className="mt-5">
          <Button onClick={() => setSaved(true)} disabled={!canEditSystemSettings} className="navy-gradient hover:opacity-90">
            <Save className="w-4 h-4 mr-2" />Saqlash
          </Button>
          {!canEditSystemSettings && <p className="mt-2 text-xs text-muted-foreground">Faqat SuperAdmin tizim parametrlarini o'zgartira oladi.</p>}
        </div>
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center"><Bell className="w-5 h-5" /></div>
            <div>
              <h3 className="font-heading font-bold">Bildirishnomalar</h3>
              <p className="text-xs text-muted-foreground">Qanday xabarlarni olishni tanlang</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            <ToggleRow id="n-email" label="Email bildirishnomalari" description="Muhim xabarlar emailga yuboriladi" checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
            <ToggleRow id="n-push" label="Push bildirishnomalari" description="Brauzer va mobil xabarlar" checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
            <ToggleRow id="n-lessons" label="Dars o'zgarishlari" description="Dars bekor qilinishi yoki ko'chirilishi haqida" checked={notif.lessons} onChange={(v) => setNotif({ ...notif, lessons: v })} />
            <ToggleRow id="n-payments" label="To'lov eslatmalari" description="To'lov muddati va balans haqida" checked={notif.payments} onChange={(v) => setNotif({ ...notif, payments: v })} />
            <ToggleRow id="n-news" label="Yangiliklar" description="Platforma yangilanishlari haqida" checked={notif.news} onChange={(v) => setNotif({ ...notif, news: v })} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h3 className="font-heading font-bold">Xavfsizlik</h3>
              <p className="text-xs text-muted-foreground">Hisob himoyasi sozlamalari</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            <ToggleRow id="sec-2fa" label="Ikki faktorli autentifikatsiya" description="Kirishda SMS yoki email kod so'raladi" checked={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} />
            <ToggleRow id="sec-sessions" label="Faol seanslar haqida xabar" description="Yangi qurilmadan kirishda eslatma" checked={security.sessions} onChange={(v) => setSecurity({ ...security, sessions: v })} />
          </div>
          <Link to="/profile" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            <KeyRound className="w-4 h-4" />Parolni o'zgartirish
          </Link>
        </div>
      </div>
    </div>
  );
}