import { useState, type FormEvent } from "react";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { Loader2, Mail, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
    } catch {
      // Hisob mavjud yoki yo'qligi oshkor bo'lmasligi kerak
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout icon={MailCheck} title="Kod yuborildi">
        <p className="text-center text-sm text-muted-foreground">
          Agar bu telefon yoki email bilan hisob mavjud bo'lsa, tiklash kodi yuborildi. Kod 5 daqiqa amal qiladi.
        </p>
        <a href="/reset-password" className="mt-6 flex h-12 w-full items-center justify-center rounded-xl accent-gradient font-semibold text-white shadow-lg shadow-accent/20 transition-opacity hover:opacity-90">
          Kodni kiritish
        </a>
        <a href="/login" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Kirish sahifasiga qaytish
        </a>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Mail} title="Parolni tiklash" subtitle="Telefon raqamingiz yoki emailingizni kiriting — tiklash kodini yuboramiz.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-sm font-medium">Telefon yoki email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <Input
              id="identifier"
              type="text"
              autoFocus
              placeholder="+998901234567 yoki siz@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-muted/40 border-border"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold text-base accent-gradient text-white shadow-lg shadow-accent/20 hover:opacity-90">
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yuborilmoqda...</>) : "Kod yuborish"}
        </Button>
        <a href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Kirish sahifasiga qaytish
        </a>
      </form>
    </AuthLayout>
  );
}
