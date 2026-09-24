import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { paymentsApi } from "@/api/services/paymentsApi";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { formatDate, formatMoney } from "@/lib/format";

type PaymentRow = { id: number; amount: number | string; method: string; status?: string; paidAt?: string | null };

const METHOD_LABELS: Record<string, string> = { CASH: "Naqd", CARD: "Karta", TRANSFER: "O'tkazma" };

export default function Payments() {
  const [data, setData] = useState<{ items: PaymentRow[]; balance: number | string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    paymentsApi.my()
      .then((res) => { if (alive) setData(res); })
      .catch((err) => { if (alive) setError(err.message || "To'lovlarni yuklashda xatolik"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const items = data?.items || [];
  const balance = Number(data?.balance || 0);

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">To'lovlar</h2>
      <p className="text-sm text-muted-foreground mt-0.5">To'lovlar tarixi va hisob holati</p>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
            <div className={"w-12 h-12 rounded-xl flex items-center justify-center " + (balance > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{balance > 0 ? "To'lanmagan qarz" : "Hisob holati"}</p>
              <p className="font-heading text-2xl font-bold mt-0.5">
                {balance > 0 ? formatMoney(balance) : "Qarz yo'q"}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-6 py-3.5 font-medium w-10">#</th>
                    <th className="px-6 py-3.5 font-medium">Sana</th>
                    <th className="px-6 py-3.5 font-medium">Summa</th>
                    <th className="px-6 py-3.5 font-medium">Usul</th>
                    <th className="px-6 py-3.5 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((p, i) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{formatDate(p.paidAt)}</td>
                      <td className="px-6 py-3.5 font-semibold">{formatMoney(p.amount)}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={p.status || "PAID"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {items.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">To'lov tarixi bo'sh.</p>
          )}
        </>
      )}
    </div>
  );
}
