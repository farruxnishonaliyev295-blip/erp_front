import React, { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthBackdrop from "@/components/AuthBackdrop";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles, BarChart3 } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, mustChangePassword } = await apiClient.login(identifier, password);
      if (mustChangePassword) {
        sessionStorage.setItem("pendingChangePassword", "1");
        window.location.href = "/change-password";
        return;
      }
      const roleDashboard = user.role === "STUDENT"
        ? "/student"
        : user.role === "TEACHER"
          ? "/teacher"
          : "/admin";
      window.location.href = returnTo === "/" ? roleDashboard : returnTo;
    } catch (err) {
      const status = typeof err === "object" && err !== null && "status" in err
        ? (err as { status?: number }).status
        : undefined;
      setError(status === 401 ? "Telefon, email yoki parol noto'g'ri" : "Kirish amalga oshmadi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShieldCheck, label: "Xavfsiz kirish" },
    { icon: BarChart3, label: "To'liq nazorat" },
    { icon: Sparkles, label: "Aqlli avtomatika" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center">
          <BrandLogo compact showText={false} />
        </div>

        <div className="relative mt-[-1.75rem] rounded-3xl border border-border/60 bg-card/80 p-8 pt-12 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mb-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Learnix ERP / CRM</p>
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Xush kelibsiz</h1>
            <p className="mt-2 text-sm text-muted-foreground">Davom etish uchun tizimga kiring</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">Telefon yoki email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="+998901234567 yoki siz@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-muted/40 border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Parol</Label>
                <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Parolni unutdingizmi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl bg-muted/40 border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary" />
              Eslab qolish
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-base accent-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  Tizimga kirish
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-5 border-t border-border/60 pt-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {f.label}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">© 2026 Learnix. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  );
}
