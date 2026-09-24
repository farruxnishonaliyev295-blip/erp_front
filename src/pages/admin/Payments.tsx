import React, { useEffect, useState } from "react";
import { MoreHorizontal, Wallet } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import TablePagination from "@/components/ui/TablePagination";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { paymentsApi } from "@/api/services/paymentsApi";
import type { Payment } from "@/api/types";

const methodLabel: Record<string, string> = { CARD: "Karta", CASH: "Naqd", TRANSFER: "O'tkazma" };
const formatMoney = (value: number | string) => `${Number(value).toLocaleString("uz-UZ")} so'm`;

type PaymentResponse = { items: Payment[]; totalAmount: number | string; meta: { total: number; totalPages: number } };

export default function Payments() {
  const [response, setResponse] = useState<PaymentResponse>({ items: [], totalAmount: 0, meta: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setLoading(true);
    paymentsApi.list({ page, limit })
      .then((data) => setResponse(data as PaymentResponse))
      .catch((requestError) => setError(requestError.message || "To'lovlarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, [page, limit]);

  const totalPaid = Number(response.totalAmount || 0);

  return (
    <div>
      <PageHeader title="To'lovlar" subtitle="To'lovlar tarixi va balanslar" actionLabel="Yangi to'lov" />
      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3"><Wallet className="w-5 h-5" /></div><p className="text-2xl font-heading font-bold">{formatMoney(totalPaid)}</p><p className="text-sm text-muted-foreground">Jami to'langan</p></div>
        <div className="bg-card rounded-2xl border border-border p-5"><div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3"><Wallet className="w-5 h-5" /></div><p className="text-2xl font-heading font-bold">{response.meta.total}</p><p className="text-sm text-muted-foreground">Jami operatsiyalar</p></div>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden"><div className="overflow-x-auto scrollbar-thin"><table className="w-full text-sm"><thead className="bg-muted/40 text-muted-foreground"><tr><th className="text-left font-medium px-6 py-3.5">Talaba</th><th className="text-left font-medium px-6 py-3.5">Summa</th><th className="text-left font-medium px-6 py-3.5">Usul</th><th className="text-left font-medium px-6 py-3.5">Sana</th><th className="text-left font-medium px-6 py-3.5">Holat</th><th className="px-6 py-3.5"></th></tr></thead><tbody className="divide-y divide-border">{response.items.map((payment) => <tr key={payment.id} className="hover:bg-muted/30 transition-colors"><td className="px-6 py-3.5 font-medium">{payment.student.user.firstName} {payment.student.user.lastName}</td><td className="px-6 py-3.5 font-semibold">{formatMoney(payment.amount)}</td><td className="px-6 py-3.5 text-muted-foreground">{methodLabel[payment.method] || payment.method}</td><td className="px-6 py-3.5 text-muted-foreground">{new Date(payment.paidAt).toLocaleDateString("uz-UZ")}</td><td className="px-6 py-3.5"><StatusBadge status="PAID" /></td><td className="px-6 py-3.5"><button className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td></tr>)}</tbody></table></div></div>
      <TablePagination
        page={page} totalPages={response.meta.totalPages || 1} total={response.meta.total} limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />
    </div>
  );
}
