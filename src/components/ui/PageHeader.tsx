import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Archive, Download, Check, UsersRound, BookOpen, CreditCard, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type FilterOption = { label: string; value: string };

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  showActions?: boolean;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  archiveHref?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel = "Qo'shish",
  onAction,
  showActions = true,
  filterOptions,
  filterValue = "",
  onFilterChange,
  archiveHref,
}: PageHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const isFiltered = filterValue !== "";
  const activeLabel = filterOptions?.find((o) => o.value === filterValue)?.label;
  const icon = title.toLowerCase().includes("talaba") ? UsersRound : title.toLowerCase().includes("o'qit") ? UsersRound : title.toLowerCase().includes("kurs") ? BookOpen : title.toLowerCase().includes("to'lov") ? CreditCard : LayoutDashboard;
  const Icon = icon;

  return (
    <div className="erp-page-header">
      <div className="erp-page-banner">
        <div className="erp-banner-icon"><Icon className="w-8 h-8" /></div>
        <div className="erp-banner-copy">
          <h2 className="erp-page-title">{title}</h2>
          {subtitle && <p className="erp-page-subtitle">{subtitle}</p>}
        </div>
        <div className="erp-banner-art" aria-hidden="true"><span>◆</span><span>▰</span><span>◢</span></div>
      </div>

      {showActions && (
        <div className="erp-page-actions">
          <div className="erp-page-tools">
            <div className="erp-tool-search">
              <Search className="w-5 h-5 text-slate-400" />
              <input placeholder="Qidirish..." />
            </div>
            {filterOptions && filterOptions.length > 0 ? (
              <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="erp-tool-btn"><Filter className={`w-4 h-4 ${isFiltered ? "text-emerald-600" : "text-slate-500"}`} /><span>{isFiltered ? activeLabel : "Filtr"}</span></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px] p-2 rounded-2xl border border-border bg-card shadow-xl space-y-1">
                  <DropdownMenuItem onClick={() => { onFilterChange?.(""); setFilterOpen(false); }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm ${!isFiltered ? "bg-accent/10 text-accent font-semibold" : "text-foreground hover:bg-muted/70"}`}>
                    <div className="w-4">{!isFiltered && <Check className="w-4 h-4 text-accent" />}</div><span>Barchasi</span>
                  </DropdownMenuItem>
                  {filterOptions.map((opt) => {
                    const selected = opt.value === filterValue;
                    return <DropdownMenuItem key={opt.value} onClick={() => { onFilterChange?.(opt.value); setFilterOpen(false); }} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm ${selected ? "bg-accent/10 text-accent font-semibold" : "text-foreground hover:bg-muted/70"}`}>
                      <div className="w-4">{selected && <Check className="w-4 h-4 text-accent" />}</div><span>{opt.label}</span>
                    </DropdownMenuItem>;
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <button className="erp-tool-btn"><Filter className="w-4 h-4 text-slate-500" /><span>Filtr</span></button>}
            {archiveHref ? <Link to={archiveHref} className="erp-tool-btn"><Archive className="w-4 h-4" /><span>Arxiv</span></Link> : <button className="erp-tool-btn"><Download className="w-4 h-4" /><span>Eksport</span></button>}
            {actionLabel && <button onClick={onAction} className="erp-tool-btn erp-tool-primary"><Plus className="w-4 h-4" /><span>{actionLabel}</span></button>}
          </div>
        </div>
      )}
    </div>
  );
}
