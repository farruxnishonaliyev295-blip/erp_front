import { useMemo, useState } from "react";
import { HelpCircle, Search, ChevronDown, BookOpen, Users2, CalendarCheck, Bell, Send, CheckCircle2 } from "lucide-react";

const FAQ = [
  { q: "Davomatda talabalar ko‘rinmasa nima qilaman?", a: "Avval to‘g‘ri guruh va darsni tanlang. Talabalar guruh tarkibidan avtomatik olinadi. Yangilash tugmasini bosing. Agar baribir ko‘rinmasa, guruhga talaba biriktirilganini administrator orqali tekshiring." },
  { q: "Bildirishnomalarni qanday o‘qilgan deb belgilayman?", a: "Bildirishnomani bosing — u o‘qilgan holatga o‘tadi. Barcha xabarlarni bir martada o‘qilgan qilish uchun “Barchasini o‘qish” tugmasidan foydalaning." },
  { q: "Guruhim ko‘rinmasa nima qilish kerak?", a: "Sizga biriktirilgan guruhlar avtomatik yuklanadi. Sahifani yangilang. Guruh hali ham ko‘rinmasa, administrator sizni o‘qituvchi sifatida guruhga biriktirganini tekshirishi kerak." },
  { q: "Uy vazifasini qanday tekshiraman?", a: "O‘qituvchi menyusidagi “Uy vazifalari” bo‘limiga kiring, kerakli vazifani tanlang va talabalar topshiriqlarini ko‘rib, baho yoki izoh qoldiring." },
  { q: "Kutubxonada nima topish mumkin?", a: "Kutubxonada tizimdagi kurslar va ular haqidagi o‘quv ma’lumotlari ko‘rsatiladi. Qidiruv orqali kurs nomi yoki tavsifi bo‘yicha kerakli resursni topishingiz mumkin." },
];

const GUIDE = [
  { icon: CalendarCheck, title: "Davomat", text: "Guruh → darsni tanlang → har bir talaba holatini belgilang → Davomatni saqlash." },
  { icon: Bell, title: "Bildirishnomalar", text: "Yangi xabarlarni ko‘ring, keraklisini o‘qilgan deb belgilang yoki barcha xabarlarni bir martada o‘qing." },
  { icon: BookOpen, title: "Kutubxona", text: "Kurslarni qidiring, faol/nofaol resurslarni filtrlang va kurs ma’lumotlarini ko‘ring." },
  { icon: Users2, title: "Guruhlar", text: "Sizga biriktirilgan guruhlar, talabalar va darslar bilan ishlang." },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const [issue, setIssue] = useState("");
  const [sent, setSent] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(x => `${x.q} ${x.a}`.toLowerCase().includes(q));
  }, [query]);

  const send = async () => {
    if (!issue.trim()) return;
    try {
      await navigator.clipboard?.writeText(issue.trim());
    } catch {}
    localStorage.setItem("erp_help_draft", issue.trim());
    setSent(true);
    setIssue("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="erp-page-banner">
        <div className="erp-banner-icon"><HelpCircle className="w-8 h-8" /></div>
        <div>
          <h2 className="erp-page-title">Yordam markazi</h2>
          <p className="erp-page-subtitle">ERP tizimidan foydalanish bo‘yicha yo‘riqnoma va tez-tez so‘raladigan savollar</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="erp-form-control pl-10" placeholder="Savol yoki mavzuni qidiring..." />
        </div>
      </div>

      <section>
        <h3 className="font-heading font-bold text-lg mb-3">Tezkor yo‘riqnoma</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GUIDE.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
              <div><b>{title}</b><p className="text-sm text-muted-foreground mt-1">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-heading font-bold text-lg mb-3">Ko‘p so‘raladigan savollar</h3>
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {filtered.map((item, index) => (
            <div key={item.q}>
              <button type="button" onClick={() => setOpen(open === index ? null : index)} className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-muted/20">
                <span className="font-semibold">{item.q}</span><ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open === index ? "rotate-180" : ""}`} />
              </button>
              {open === index && <div className="px-5 pb-5 text-sm text-muted-foreground leading-6">{item.a}</div>}
            </div>
          ))}
          {!filtered.length && <div className="p-8 text-center text-muted-foreground">Savol topilmadi.</div>}
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Send className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-bold">Muammo haqida xabar qoldirish</h3><p className="text-sm text-muted-foreground mt-1">Muammoni batafsil yozing. Matn qurilmada vaqtinchalik saqlanadi va administratorga yuborish uchun nusxalanadi.</p></div>
        </div>
        <textarea value={issue} onChange={e => setIssue(e.target.value)} className="erp-form-control mt-4 min-h-[120px]" placeholder="Masalan: Davomat sahifasida 12-guruh talabalarini ko‘rmayapman..." />
        <div className="flex justify-end mt-3">
          <button type="button" disabled={!issue.trim()} onClick={() => void send()} className="h-10 px-4 rounded-xl accent-gradient text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> Muammoni tayyorlash</button>
        </div>
        {sent && <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Muammo matni nusxalandi va qurilmada saqlandi.</div>}
      </section>
    </div>
  );
}
