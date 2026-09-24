import { useEffect, useMemo, useState } from "react";
import {
  Wallet, CalendarDays, BookOpen, Settings, CheckCheck, Bell, ShieldAlert,
  RefreshCw, GraduationCap, FileCheck2, Clock3
} from "lucide-react";
import { notificationsApi, type AppNotification } from "@/api/services/notificationsApi";

const meta: Record<string, { label: string; icon: any }> = {
  PAYMENT: { label: "To‘lovlar", icon: Wallet },
  LESSON: { label: "Darslar", icon: CalendarDays },
  HOMEWORK: { label: "Vazifalar", icon: FileCheck2 },
  EXAM: { label: "Imtihonlar", icon: GraduationCap },
  SYSTEM: { label: "Tizim", icon: Settings },
};

export default function Notifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response: any = await notificationsApi.list({ limit: 100 });
      const list = Array.isArray(response) ? response : response?.items || [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Bildirishnomalarni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const unread = items.filter(x => !x.readAt).length;
  const filtered = useMemo(() => items.filter(n => {
    const typeOk = filter === "ALL" || n.type === filter;
    const unreadOk = !onlyUnread || !n.readAt;
    return typeOk && unreadOk;
  }), [items, filter, onlyUnread]);

  const read = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setItems(current => current.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (e: any) {
      setError(e?.message || "Bildirishnomani o‘qilgan deb belgilab bo‘lmadi");
    }
  };

  const markAll = async () => {
    if (!unread) return;
    setWorking(true);
    setError("");
    try {
      await notificationsApi.markAllRead();
      setItems(current => current.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    } catch (e: any) {
      setError(e?.message || "Bildirishnomalarni o‘qilgan deb belgilab bo‘lmadi");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="erp-page-banner">
        <div className="erp-banner-icon"><Bell className="w-8 h-8" /></div>
        <div>
          <h2 className="erp-page-title">Bildirishnomalar</h2>
          <p className="erp-page-subtitle">O‘qituvchiga tegishli yangi xabarlar, darslar va vazifalar</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="ml-auto h-10 px-3 rounded-xl border bg-white inline-flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Yangilash
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {["ALL", ...Object.keys(meta)].map(k => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3.5 h-9 rounded-xl border text-sm ${filter === k ? "bg-primary text-primary-foreground" : "bg-card border-border"}`}>
            {k === "ALL" ? "Barchasi" : meta[k].label}
          </button>
        ))}
        <button onClick={() => setOnlyUnread(v => !v)}
          className={`px-3.5 h-9 rounded-xl border text-sm ${onlyUnread ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-card border-border"}`}>
          Faqat o‘qilmagan ({unread})
        </button>
        <button onClick={() => void markAll()} disabled={!unread || working}
          className="ml-auto px-3.5 h-9 rounded-xl border border-border bg-card flex items-center gap-2 disabled:opacity-50">
          <CheckCheck className="w-4 h-4" /> Barchasini o‘qish
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">{error}</div>}

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">Bildirishnomalar yuklanmoqda...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const info = meta[n.type] || { label: "Boshqa", icon: Bell };
            const Icon = info.icon;
            return (
              <button key={n.id} type="button" onClick={() => !n.readAt && void read(n.id)}
                className={`w-full text-left bg-card rounded-2xl border p-5 flex gap-4 transition hover:shadow-sm ${!n.readAt ? "border-primary/40 bg-primary/[0.02]" : "border-border"}`}>
                <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-center gap-2"><b>{n.title}</b>{!n.readAt && <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Yangi</span>}</div>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock3 className="w-3 h-3" />{new Date(n.createdAt).toLocaleString("uz-UZ")}</span>
                  </div>
                  <p className="text-xs text-primary mt-1">{info.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                </div>
                {!n.readAt && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </button>
            );
          })}
          {!filtered.length && <div className="bg-card border border-border rounded-2xl p-12 text-center"><ShieldAlert className="w-8 h-8 mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Bildirishnoma topilmadi</p><p className="text-sm text-muted-foreground mt-1">Tanlangan filtr bo‘yicha xabarlar mavjud emas.</p></div>}
        </div>
      )}
    </div>
  );
}
