import { useState, type FormEvent } from "react";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { Loader2, Lock, AlertCircle } from "lucide-react";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const forced = sessionStorage.getItem("pendingChangePassword") === "1";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Parollar mos kelmadi");
      return;
    }
    setLoading(true);
    try {
      await apiClient.changePassword(oldPassword, newPassword);
      sessionStorage.removeItem("pendingChangePassword");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parol almashtirilmadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout icon={Lock} title="Parolni almashtirish">
      {forced && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Xavfsizlik uchun birinchi kirishda parolingizni o'zingiz belgilashingiz kerak.</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oldPassword" className="text-sm font-medium">Hozirgi parol</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <Input id="oldPassword" type="password" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="pl-11 h-12 rounded-xl bg-muted/40 border-border" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">Yangi parol</Label>
          <Input id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl bg-muted/40 border-border" minLength={6} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-sm font-medium">Yangi parolni tasdiqlash</Label>
          <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 rounded-xl bg-muted/40 border-border" minLength={6} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold text-base accent-gradient text-white shadow-lg shadow-accent/20 hover:opacity-90">
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saqlanmoqda...</>) : "Parolni almashtirish"}
        </Button>
      </form>
    </AuthLayout>
  );
}
