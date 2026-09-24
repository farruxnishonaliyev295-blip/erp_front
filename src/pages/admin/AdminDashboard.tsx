import React, { useEffect, useMemo, useState } from "react";
import { Users2, UserCog, Users, Wallet, TrendingUp, CalendarCheck, RefreshCw } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { reportsApi } from "@/api/services/reportsApi";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string,string> = { ACTIVE:"Faol", INACTIVE:"Nofaol", PLANNED:"Rejalashtirilgan", DONE:"Yakunlangan", PENDING:"Kutilmoqda" };
  return <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent/10 text-accent">{map[status] || status}</span>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const load = () => { setError(""); reportsApi.dashboard().then(setData).catch(e => setError(e?.message || "Ma'lumotlarni yuklab bo'lmadi")); };
  useEffect(load, []);
  const stats = data?.stats || {};
  const revenue = data?.monthlyRevenue || [];
  const maxRevenue = useMemo(() => Math.max(1, ...revenue.map((x:any)=>Number(x.revenue)||0)), [revenue]);

  if (error) return <div className="space-y-4"><div className="bg-card border border-border rounded-2xl p-8 text-center"><p className="text-destructive mb-4">{error}</p><button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground"><RefreshCw className="w-4 h-4"/>Qayta yuklash</button></div></div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Dashboard yuklanmoqda...</div>;

  return <div className="space-y-6">
    <div className="erp-page-banner"><div className="erp-banner-icon"><TrendingUp className="w-8 h-8"/></div><div><h2 className="erp-page-title">Dashboard</h2><p className="erp-page-subtitle">Real backend ma'lumotlari asosidagi umumiy ko‘rinish</p></div></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Talabalar" value={stats.totalStudents ?? 0} accent="primary"/>
      <StatCard icon={UserCog} label="O‘qituvchilar" value={stats.totalTeachers ?? 0} accent="accent"/>
      <StatCard icon={Users2} label="Faol guruhlar" value={stats.activeGroups ?? 0} accent="green"/>
      <StatCard icon={Wallet} label="Shu oy daromadi" value={`${Number(stats.monthlyRevenue||0).toLocaleString("uz-UZ")} so‘m`} accent="amber"/>
    </div>
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5"><div><h3 className="font-heading font-bold text-lg">Daromad dinamikasi</h3><p className="text-sm text-muted-foreground">So‘nggi 6 oy — backenddan</p></div><CalendarCheck className="w-5 h-5 text-muted-foreground"/></div>
      <div className="h-64 flex items-end gap-3">
        {revenue.map((x:any,i:number)=><div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><div className="w-full max-w-16 rounded-t-xl bg-primary/80" style={{height:`${Math.max(4, Number(x.revenue)/maxRevenue*85)}%`}} title={`${Number(x.revenue).toLocaleString()} so‘m`}/><span className="text-[11px] text-muted-foreground">{x.month}/{String(x.year).slice(-2)}</span></div>)}
      </div>
    </div>
    <div className="bg-card rounded-2xl border border-border overflow-hidden"><div className="px-6 py-4 border-b border-border"><h3 className="font-heading font-bold">So‘nggi to‘lovlar</h3></div>
      <div className="divide-y divide-border">{(data.recentPayments||[]).map((p:any)=><div key={p.id} className="px-6 py-4 flex justify-between gap-4"><div><p className="font-medium">{p.studentName || "—"}</p><p className="text-xs text-muted-foreground">{p.method} · {p.paidAt ? new Date(p.paidAt).toLocaleDateString("uz-UZ") : "—"}</p></div><b>{Number(p.amount).toLocaleString("uz-UZ")} so‘m</b></div>)}{!(data.recentPayments||[]).length&&<p className="p-8 text-center text-muted-foreground">To‘lovlar mavjud emas.</p>}</div>
    </div>
  </div>;
}
