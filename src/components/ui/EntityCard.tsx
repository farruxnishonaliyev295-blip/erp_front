import React, { useState } from "react";
import { Eye, Pencil, MoreHorizontal, Trash2, Check, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type StatusOption = {
  value: string;
  label: string;
  dot: string;
};

export type CardDetail = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

type EntityCardProps = {
  /** Avatar: img src yoki initials harflari */
  avatar?: string | null;
  avatarInitials?: string;
  avatarClass?: string;
  /** Sarlavha va kichik matn */
  title: string;
  subtitle?: string;
  /** Status badge */
  statusBadge?: React.ReactNode;
  /** Detail qatorlar */
  details?: CardDetail[];
  /** Progress bar (0-100) */
  progress?: { value: number; label: string; current: number; max: number };
  /** Status options (uchta nuqta menyu uchun) */
  statusOptions?: StatusOption[];
  currentStatus?: string;
  /** Callbacks */
  onView?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
  onDelete?: () => void;
  /** Arxiv rejimi: Tahrirlash/Status o'rniga faqat Tiklash tugmasi ko'rsatiladi */
  archived?: boolean;
  onRestore?: () => void;
  /** Delete confirm matni */
  deleteTitle?: string;
  deleteDescription?: string;
};

export default function EntityCard({
  avatar,
  avatarInitials = "?",
  avatarClass = "navy-gradient text-white",
  title,
  subtitle,
  statusBadge,
  details = [],
  progress,
  statusOptions = [],
  currentStatus,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
  archived = false,
  onRestore,
  deleteTitle = "O'chirishni tasdiqlaysizmi?",
  deleteDescription = "Ushbu elementni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.",
}: EntityCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="erp-entity-card bg-card rounded-2xl border border-border flex flex-col hover:shadow-lg hover:shadow-foreground/5 transition-all overflow-hidden">
        {/* Card body */}
        <div className="p-5 flex-1">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm select-none ${avatarClass}`}
                >
                  {avatarInitials}
                </div>
              )}
            </div>

            {/* Title & subtitle */}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-base leading-tight truncate">
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
              )}
            </div>

            {/* Status badge */}
            {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
          </div>

          {/* Progress bar */}
          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{progress.label}</span>
                <span className="font-medium">
                  {progress.current}/{progress.max}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    progress.value >= 90
                      ? "bg-destructive"
                      : progress.value >= 70
                      ? "bg-amber-500"
                      : "bg-accent"
                  }`}
                  style={{ width: `${progress.value}%` }}
                />
              </div>
            </div>
          )}

          {/* Details list */}
          {details.length > 0 && (
            <div className="mt-4 space-y-2">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
                    {d.icon}
                    {d.label}
                  </span>
                  <span className="font-medium text-foreground text-right truncate max-w-[55%]">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="border-t border-border flex divide-x divide-border">
          {/* Eye — view */}
          <button
            type="button"
            title="Ko'rish"
            onClick={onView}
            className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Pencil — edit (arxivda ko'rsatilmaydi) */}
          {!archived && (
            <button
              type="button"
              title="Tahrirlash"
              onClick={onEdit}
              className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Arxivda — Tiklash tugmasi; aks holda status menyusi */}
          {archived ? (
            <button
              type="button"
              title="Tiklash"
              onClick={onRestore}
              className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : statusOptions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Status o'zgartirish"
                  className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-[185px] p-1.5 rounded-xl border border-border bg-card shadow-xl"
              >
                <p className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </p>
                <DropdownMenuSeparator className="my-1" />
                {statusOptions.map((opt) => {
                  const isActive = opt.value === currentStatus;
                  return (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onStatusChange?.(opt.value)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent font-semibold"
                          : "text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                      <span className="flex-1">{opt.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:bg-muted/50 transition-colors cursor-default"
              disabled
            >
              <MoreHorizontal className="w-4 h-4 opacity-30" />
            </button>
          )}

          {/* Trash — delete (arxivda: butunlay o'chirish) */}
          <button
            type="button"
            title={archived ? "Butunlay o'chirish" : "O'chirish"}
            onClick={() => setDeleteOpen(true)}
            className="flex-1 flex items-center justify-center py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold">
              {deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                onDelete?.();
                setDeleteOpen(false);
              }}
            >
              {archived ? "Butunlay o'chirish" : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
