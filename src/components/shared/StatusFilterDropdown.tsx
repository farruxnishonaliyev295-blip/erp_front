import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HOMEWORK_STATUS_OPTIONS } from "./HomeworkStatus";

export default function StatusFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = HOMEWORK_STATUS_OPTIONS.find((o) => o.value === value) || HOMEWORK_STATUS_OPTIONS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-accent/50 bg-card text-sm font-medium hover:bg-muted/50 transition-colors outline-none">
        {current.label}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl p-1.5">
        {HOMEWORK_STATUS_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            className="gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer"
          >
            <span className={"w-2.5 h-2.5 rounded-full shrink-0 " + o.dot} />
            <span className={o.value !== "ALL" ? "text-white px-2.5 py-0.5 rounded-full text-xs font-semibold " + o.pill : ""}>
              {o.label}
            </span>
            {o.value === value && <Check className="w-4 h-4 ml-auto text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
