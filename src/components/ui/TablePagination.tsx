import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total?: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
};

export default function TablePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  className = "",
}: TablePaginationProps) {
  // Faqat hech qanday natija bo'lmasa yashiriladi — aks holda "Ko'rsatish"
  // tanlovi va jami son har doim ko'rinib tursin, hatto bitta sahifa bo'lsa ham.
  if (total === 0) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 py-4 px-1 text-sm ${className}`}
    >
      {/* Limit Selector */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Ko'rsatish:</span>
        {onLimitChange && (
          <Select
            value={String(limit)}
            onValueChange={(val) => onLimitChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-20 rounded-xl bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {total !== undefined && (
          <span className="text-xs ml-2 text-muted-foreground/80">
            (Jami: {total})
          </span>
        )}
      </div>

      {/* Pages Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground text-xs select-none"
              >
                ...
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <Button
              key={`page-${p}`}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              className={`h-8 min-w-8 px-2.5 rounded-xl font-medium ${
                isCurrent
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => onPageChange(Number(p))}
            >
              {p}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Keyingi sahifa"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
