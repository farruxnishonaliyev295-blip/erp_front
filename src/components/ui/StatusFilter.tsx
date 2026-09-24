import { useState } from "react";
import { Filter, ChevronDown, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type StatusOption = {
  label: string;
  value: string;
};

type StatusFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
  allLabel?: string; // backward compat uchun saqlab qolindi, ishlatilmaydi
  className?: string;
};

export default function StatusFilter({
  value,
  onChange,
  options,
  className = "",
}: StatusFilterProps) {
  const [open, setOpen] = useState(false);

  const isFiltered = value !== "";
  const activeLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/30
              ${
                isFiltered
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                  : "border-teal-400/60 bg-card text-foreground hover:bg-accent/10"
              } ${className}`}
          >
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{isFiltered ? activeLabel : "Filter"}</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[210px] p-2 rounded-2xl border border-border bg-card shadow-xl space-y-1"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                  isSelected
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold"
                    : "text-foreground hover:bg-muted/70 font-medium"
                }`}
              >
                <div className="w-4 flex items-center justify-center">
                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
                <span>{opt.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filterni tozalash knopkasi — faqat filter tanlanganda ko'rinadi */}
      {isFiltered && (
        <button
          type="button"
          aria-label="Filterni tozalash"
          onClick={() => onChange("")}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-muted bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Tozalash
        </button>
      )}
    </div>
  );
}
