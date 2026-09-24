import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, change, trend = "up", accent = "primary", subtitle }) {
  const accents = {
    primary: "from-primary/10 to-primary/5 text-primary",
    accent: "from-accent/15 to-accent/5 text-accent",
    green: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="group bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-heading font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </div>
  );
}