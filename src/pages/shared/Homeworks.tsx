import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FileUp, Plus, RefreshCw, Send, UserCheck, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { groupsApi } from "@/api/services/groupsApi";
import { studentsApi } from "@/api/services/studentsApi";
import { profileApi } from "@/api/services/profileApi";
import { lessonsApi } from "@/api/services/lessonsApi";
import { homeworkApi } from "@/api/services/homeworkApi";
import { uploadsApi } from "@/api/services/uploadsApi";
import StatusFilterDropdown from "@/components/shared/StatusFilterDropdown";
import { HomeworkStatusPill, deriveHwStatus } from "@/components/shared/HomeworkStatus";
import { formatDate } from "@/lib/format";

interface Group { id:number; name:string }
interface Lesson { id:number; title:string; date:string; group?:Group }
interface Submission { id:number; homeworkId:number; studentId:number; content?:string|null; fileUrl?:string|null; status:string; grade?:number|null; feedback?:string|null; createdAt:string; student?:{user:{firstName:string;lastName:string}} }
interface Homework { id:number; title:string; description?:string|null; fileUrl?:string|null; deadline:string; lessonId:number; groupId:number; group?:Group; lesson?:{id:number;title:string;sequence:number}; _count?:{submissions:number}; submissions?:Submission[] }

const roleStatus = (status:string) => status === "NEEDS_REVISION" || status === "REJECTED" ? "Qaytarilgan" : status === "ACCEPTED" ? "Qabul qilingan" : "Kutilmoqda";

export default function Homeworks() {
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const [groups,setGroups]=useState<Group[]>([]);
  const [lessons,setLessons]=useState<Lesson[]>([]);
  const [rows,setRows]=useState<Homework[]>([]);
  const [subs,setSubs]=useState<Record<number,Submission>>({});
  const [selected,setSelected]=useState<Homework|null>(null);
  const [submissions,setSubmissions]=useState<Submission[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState("ALL");
  const [showCreate,setShowCreate]=useState(false);
  const [showSubmit,setShowSubmit]=useState<Homework|null>(null);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  const load = async () => {
    if(!user) return;
    setLoading(true); setError("");
    try {
      let gs:Group[]=[];
      if(isStudent){
        const me:any=await studentsApi.my();
        gs=(me?.studentGroups||[]).map((x:any)=>x.group).filter(Boolean);
      } else if(isTeacher){
        const me:any=await profileApi.me();
        const tid=me?.teacherProfile?.id;
        const r:any=await groupsApi.list({teacherId:tid,limit:100} as any);
        gs=r?.items||[];
      }
      setGroups(gs);
      const nested=await Promise.all(gs.map(g=>homeworkApi.list(g.id) as Promise<any>));
      const flat:Homework[]=nested.flatMap((x:any)=>Array.isArray(x)?x:(x?.items||[])).map((h:any)=>({...h,group:h.group||gs.find(g=>g.id===h.groupId)}));
      flat.sort((a,b)=>new Date(b.deadline).getTime()-new Date(a.deadline).getTime());
      setRows(flat);
      if(isStudent){
        const sr:any=await homeworkApi.mySubmissions();
        const arr=Array.isArray(sr)?sr:(sr?.items||[]);
        const map:Record<number,Submission>={};
        arr.forEach((s:Submission)=>{map[s.homeworkId]=s});
        setSubs(map);
      }
    }catch(e:any){setError(e?.message||"Uy vazifalarini yuklashda xatolik")}
    finally{setLoading(false)}
  };

  useEffect(()=>{void load()},[user?.id,isStudent,isTeacher]);

  const filtered=useMemo(()=>!isStudent||filter==="ALL"?rows:rows.filter(h=>deriveHwStatus(h,subs[h.id])===filter),[rows,subs,isStudent,filter]);

  const loadSubmissions=async(h:Homework)=>{
    setSelected(h); setSubmissions([]); setError("");
    try{const r:any=await homeworkApi.submissions(h.id);setSubmissions(Array.isArray(r)?r:(r?.items||[]))}catch(e:any){setError(e?.message||"Topshiriqlarni yuklab bo'lmadi")}
  };

  const createHomework=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setSaving(true); setError("");
    try{
      const fd=new FormData(e.currentTarget); const groupId=Number(fd.get("groupId")); const lessonId=Number(fd.get("lessonId"));
      let fileUrl:string|undefined;
      const file=fd.get("file") as File|null;
      if(file?.size) fileUrl=(await uploadsApi.file(file)).url;
      await homeworkApi.create({groupId,lessonId,title:String(fd.get("title")),description:String(fd.get("description")||""),deadline:new Date(String(fd.get("deadline"))).toISOString(),fileUrl});
      setShowCreate(false); setMessage("Uy vazifasi yaratildi. Guruh talabalariga bildirishnoma yuborildi."); await load();
    }catch(e:any){setError(e?.message||"Uy vazifasi yaratilmadi")}finally{setSaving(false)}
  };

  const submitHomework=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); if(!showSubmit)return; setSaving(true); setError("");
    try{
      const fd=new FormData(e.currentTarget); let fileUrl:string|undefined;
      const file=fd.get("file") as File|null;
      if(file?.size) fileUrl=(await uploadsApi.file(file)).url;
      await homeworkApi.submit(showSubmit.id,String(fd.get("content")||""),fileUrl);
      setShowSubmit(null); setMessage("Uy vazifasi muvaffaqiyatli topshirildi."); await load();
    }catch(e:any){setError(e?.message||"Uy vazifasi topshirilmadi")}finally{setSaving(false)}
  };

  const grade=async(id:number,status:"ACCEPTED"|"NEEDS_REVISION",gradeValue:string,feedback:string)=>{
    setSaving(true);setError("");try{await homeworkApi.grade(id,{status,grade:gradeValue?Number(gradeValue):undefined,feedback});setMessage("Topshiriq baholandi.");if(selected)await loadSubmissions(selected);await load()}catch(e:any){setError(e?.message||"Baholashda xatolik")}finally{setSaving(false)}
  };

  return <div className="space-y-6">
    <div className="erp-page-banner"><div className="erp-banner-icon"><BookOpen className="w-7 h-7"/></div><div className="erp-banner-copy"><h2 className="erp-page-title">Uy vazifalari</h2><p className="erp-page-subtitle">{isTeacher?"Guruhlarga vazifa berish va topshiriqlarni tekshirish":"Vazifalarni ko'rish, topshirish va natijalarni kuzatish"}</p></div>{isTeacher&&<button onClick={()=>setShowCreate(true)} className="ml-auto erp-tool-btn accent-gradient text-white rounded-xl px-4 font-bold inline-flex items-center gap-2"><Plus className="w-4 h-4"/>Vazifa berish</button>}</div>
    {message&&<div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm flex justify-between"><span>{message}</span><button onClick={()=>setMessage("")}><X className="w-4 h-4"/></button></div>}
    {error&&<div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm flex justify-between"><span>{error}</span><button onClick={()=>setError("")}><X className="w-4 h-4"/></button></div>}
    {isStudent&&<div className="flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-muted-foreground">Holat:</span><StatusFilterDropdown value={filter} onChange={setFilter}/></div>}
    {loading?<div className="py-20 text-center text-muted-foreground">Yuklanmoqda...</div>:<div className="erp-table-shell"><div className="erp-table-scroll"><table className="w-full min-w-[900px] text-sm"><thead><tr className="bg-[#f4f8f4] text-left text-muted-foreground"><th className="px-5 py-4">Uy vazifasi</th><th className="px-5 py-4">Dars</th><th className="px-5 py-4">Guruh</th><th className="px-5 py-4">{isStudent?"Holat":"Topshiriqlar"}</th><th className="px-5 py-4">Muddat</th><th className="px-5 py-4 text-right">Amal</th></tr></thead><tbody>{filtered.map(h=><tr key={h.id} className="border-t border-border hover:bg-muted/20"><td className="px-5 py-4 font-semibold">{h.title}<div className="text-xs text-muted-foreground mt-1">{h.description||"Izoh yo'q"}</div></td><td className="px-5 py-4">{h.lesson?.title||`Dars #${h.lessonId}`}</td><td className="px-5 py-4">{h.group?.name||"—"}</td><td className="px-5 py-4">{isStudent?<HomeworkStatusPill status={deriveHwStatus(h,subs[h.id])}/>:<button onClick={()=>void loadSubmissions(h)} className="inline-flex items-center gap-2 font-bold text-primary"><UserCheck className="w-4 h-4"/>{h._count?.submissions??0} ta</button>}</td><td className="px-5 py-4 text-muted-foreground">{formatDate(h.deadline)}</td><td className="px-5 py-4 text-right">{isStudent&&deriveHwStatus(h,subs[h.id])!=="ACCEPTED"?<button onClick={()=>setShowSubmit(h)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex gap-2"><Send className="w-4 h-4"/>Topshirish</button>:isTeacher?<button onClick={()=>void loadSubmissions(h)} className="px-3 py-2 rounded-lg border border-border font-bold">Ko'rish</button>:<CheckCircle2 className="w-5 h-5 text-emerald-600 inline"/>}</td></tr>)}</tbody></table>{!filtered.length&&<div className="p-12 text-center text-muted-foreground">Uy vazifasi topilmadi.</div>}</div></div>}

    {showCreate&&<Modal title="Yangi uy vazifasi" onClose={()=>setShowCreate(false)}><form onSubmit={createHomework} className="space-y-4"><Field label="Guruh"><select name="groupId" required className="erp-form-control" onChange={async e=>{const id=Number(e.target.value);const r:any=await lessonsApi.list({groupId:id,limit:100});setLessons(r?.items||[]);}}><option value="">Guruhni tanlang</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></Field><Field label="Dars"><select name="lessonId" required className="erp-form-control"><option value="">Darsni tanlang</option>{lessons.map(l=><option key={l.id} value={l.id}>{l.title} — {new Date(l.date).toLocaleDateString("uz-UZ")}</option>)}</select></Field><Field label="Nomi"><input name="title" required className="erp-form-control" placeholder="Masalan: 10 ta masala"/></Field><Field label="Izoh"><textarea name="description" className="erp-form-control min-h-24" placeholder="Vazifa sharti..."/></Field><div className="grid grid-cols-2 gap-3"><Field label="Muddat"><input name="deadline" type="datetime-local" required className="erp-form-control"/></Field><Field label="Fayl"><input name="file" type="file" className="erp-form-control"/></Field></div><button disabled={saving} className="w-full h-11 rounded-xl accent-gradient text-white font-bold">{saving?"Saqlanmoqda...":"Vazifani berish"}</button></form></Modal>}
    {showSubmit&&<Modal title={`Topshirish: ${showSubmit.title}`} onClose={()=>setShowSubmit(null)}><form onSubmit={submitHomework} className="space-y-4"><div className="rounded-xl bg-muted/40 p-4 text-sm"><b>Muddat:</b> {formatDate(showSubmit.deadline)}<br/><span className="text-muted-foreground">{showSubmit.description||"Izoh berilmagan"}</span></div><Field label="Javob matni"><textarea name="content" className="erp-form-control min-h-32" placeholder="Javobingizni yozing..."/></Field><Field label="Fayl biriktirish"><input name="file" type="file" className="erp-form-control"/></Field><button disabled={saving} className="w-full h-11 rounded-xl accent-gradient text-white font-bold inline-flex justify-center items-center gap-2"><Send className="w-4 h-4"/>{saving?"Yuborilmoqda...":"Uy vazifasini topshirish"}</button></form></Modal>}
    {selected&&<Modal title={`Topshiriqlar — ${selected.title}`} onClose={()=>setSelected(null)} wide><div className="space-y-3 max-h-[65vh] overflow-auto">{submissions.length===0?<div className="p-10 text-center text-muted-foreground">Hali hech kim topshirmagan.</div>:submissions.map(s=><SubmissionCard key={s.id} s={s} saving={saving} onGrade={grade}/>)}</div></Modal>}
  </div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-1.5"><span className="text-sm font-semibold">{label}</span>{children}</label>}
function Modal({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}){return <div className="fixed inset-0 z-[100] bg-black/45 flex items-center justify-center p-4"><div className={`bg-white rounded-2xl shadow-2xl w-full ${wide?"max-w-3xl":"max-w-xl"} max-h-[90vh] overflow-auto`}><div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-extrabold">{title}</h3><button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5"/></button></div><div className="p-5">{children}</div></div></div>}
function SubmissionCard({s,saving,onGrade}:{s:Submission;saving:boolean;onGrade:(id:number,status:"ACCEPTED"|"NEEDS_REVISION",grade:string,feedback:string)=>void}){const [grade,setGrade]=useState(s.grade?.toString()||"");const [feedback,setFeedback]=useState(s.feedback||"");return <div className="border rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div><b>{s.student?.user?.firstName} {s.student?.user?.lastName}</b><p className="text-xs text-muted-foreground mt-1">{new Date(s.createdAt).toLocaleString("uz-UZ")}</p></div><span className="text-xs font-bold px-2 py-1 rounded-full bg-muted">{roleStatus(s.status)}</span></div>{s.content&&<p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm whitespace-pre-wrap">{s.content}</p>}{s.fileUrl&&<a className="inline-flex mt-3 text-primary font-semibold text-sm" href={s.fileUrl} target="_blank" rel="noreferrer"><FileUp className="w-4 h-4 mr-1"/>Faylni ochish</a>}<div className="grid grid-cols-[110px_1fr] gap-3 mt-3"><input className="erp-form-control" type="number" min="0" max="100" value={grade} onChange={e=>setGrade(e.target.value)} placeholder="Baho"/><input className="erp-form-control" value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Izoh"/></div><div className="flex gap-2 mt-3"><button disabled={saving} onClick={()=>onGrade(s.id,"ACCEPTED",grade,feedback)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">Qabul qilish</button><button disabled={saving} onClick={()=>onGrade(s.id,"NEEDS_REVISION",grade,feedback)} className="px-3 py-2 rounded-lg bg-amber-500 text-white font-bold">Qaytarish</button></div></div>}
