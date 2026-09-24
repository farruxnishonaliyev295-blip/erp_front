import React, { useEffect, useState } from "react";
import { FileBarChart, RefreshCw } from "lucide-react";
import { reportsApi } from "@/api/services/reportsApi";

export default function Reports() {
 const [dashboard,setDashboard]=useState<any>(); const [courses,setCourses]=useState<any[]>([]); const [error,setError]=useState("");
 const load=async()=>{try{setError(""); const [d,c]=await Promise.all([reportsApi.dashboard(),reportsApi.courses()]); setDashboard(d); setCourses(Array.isArray(c)?c:(c?.items||[]));}catch(e:any){setError(e?.message||"Hisobotlarni yuklab bo‘lmadi")}};
 useEffect(()=>{load()},[]);
 if(error)return <div className="p-8 text-center"><p className="text-destructive mb-4">{error}</p><button onClick={load} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground inline-flex gap-2"><RefreshCw className="w-4 h-4"/>Qayta yuklash</button></div>;
 if(!dashboard)return <div className="p-8 text-center text-muted-foreground">Hisobotlar yuklanmoqda...</div>;
 const a=dashboard.weeklyAttendance||[];
 return <div className="space-y-6">
  <div className="erp-page-banner"><div className="erp-banner-icon"><FileBarChart className="w-8 h-8"/></div><div><h2 className="erp-page-title">Hisobotlar</h2><p className="erp-page-subtitle">Backenddagi real ma'lumotlar asosida</p></div></div>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Object.entries(dashboard.stats||{}).slice(0,8).map(([k,v]:any)=><div key={k} className="bg-card border border-border rounded-2xl p-5"><p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-bold mt-2">{typeof v==="number"?v.toLocaleString("uz-UZ"):String(v)}</p></div>)}</div>
  <div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="p-5 border-b border-border"><h3 className="font-heading font-bold">Kurslar hisoboti</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="px-5 py-3">Kurs</th><th className="px-5 py-3">Talabalar</th><th className="px-5 py-3">Davomat</th><th className="px-5 py-3">Daromad</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b border-border/60"><td className="px-5 py-3 font-medium">{c.name}</td><td className="px-5 py-3">{c.studentsCount??c.students??0}</td><td className="px-5 py-3">{c.attendanceRate??0}%</td><td className="px-5 py-3">{Number(c.revenue||0).toLocaleString("uz-UZ")} so‘m</td></tr>)}</tbody></table></div></div>
  <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-heading font-bold mb-4">Haftalik davomat</h3><div className="grid grid-cols-2 md:grid-cols-6 gap-3">{a.map((x:any)=><div key={x.weekDay} className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">{x.weekDay}</p><p className="font-bold text-lg mt-1">{x.present} / {x.present+x.absent}</p></div>)}</div></div>
 </div>
}
