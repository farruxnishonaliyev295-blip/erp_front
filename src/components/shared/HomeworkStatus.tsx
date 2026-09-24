export const HOMEWORK_STATUS_OPTIONS = [
  { value: "ALL", label: "Barchasi", dot: "bg-foreground/60", pill: "" },
  { value: "ACCEPTED", label: "Qabul qilingan", dot: "bg-emerald-600", pill: "bg-emerald-600 text-white" },
  { value: "NOT_GIVEN", label: "Berilmagan", dot: "bg-slate-500", pill: "bg-slate-500 text-white" },
  { value: "RETURNED", label: "Qaytarilgan", dot: "bg-amber-500", pill: "bg-amber-500 text-white" },
  { value: "NOT_DONE", label: "Bajarilmagan", dot: "bg-red-500", pill: "bg-red-500 text-white" },
  { value: "PENDING", label: "Kutayotgan", dot: "bg-indigo-500", pill: "bg-indigo-500 text-white" },
];

export function deriveHwStatus(
  hw: { deadline?: string | null },
  submission?: { status?: string } | null,
): string {
  if (!submission) {
    const overdue = hw.deadline ? new Date(hw.deadline).getTime() < Date.now() : false;
    return overdue ? "NOT_DONE" : "NOT_GIVEN";
  }
  if (submission.status === "ACCEPTED") return "ACCEPTED";
  if (submission.status === "NEEDS_REVISION") return "RETURNED";
  if (submission.status === "REJECTED") return "NOT_DONE";
  return "PENDING";
}

export function HomeworkStatusPill({ status }: { status: string }) {
  const opt = HOMEWORK_STATUS_OPTIONS.find((o) => o.value === status) || HOMEWORK_STATUS_OPTIONS[1];
  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap " + opt.pill}>
      {opt.label}
    </span>
  );
}
