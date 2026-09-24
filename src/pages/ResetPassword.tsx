import { useState, type FormEvent } from "react";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Parollar mos kelmadi");
      return;
    }
    setLoading(true);
    try {
      await apiClient.request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ identifier, code, newPassword }),
      });
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parol tiklanmadi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout icon={KeyRound} title="Yangi parol o'rnatish" subtitle="SMS yoki emailga kelgan kodni kiriting va yangi parol belgilang.">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-sm font-medium">Telefon yoki email</Label>
          <Input id="identifier" type="text" placeholder="+998901234567" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 rounded-xl bg-muted/40 border-border" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">Tiklash kodi</Label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <Input id="code" type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} className="pl-11 h-12 rounded-xl bg-muted/40 border-border tracking-[0.3em] font-mono" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">Yangi parol</Label>
          <Input id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl bg-muted/40 border-border" minLength={6} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-sm font-medium">Parolni tasdiqlash</Label>
          <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 rounded-xl bg-muted/40 border-border" minLength={6} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold text-base accent-gradient text-white shadow-lg shadow-accent/20 hover:opacity-90">
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saqlanmoqda...</>) : "Parolni yangilash"}
        </Button>
        <a href="/forgot-password" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Kodni qayta yuborish
        </a>
      </form>
    </AuthLayout>
  );
}
