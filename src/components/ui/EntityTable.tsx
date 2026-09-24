import React, { useState } from "react";
import { Eye, Pencil, Trash2, RotateCcw, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import type { StatusOption } from "@/components/ui/EntityCard";

export type EntityTableColumn<T> = { key: string; label: string; className?: string; render: (row: T) => React.ReactNode };

export default function EntityTable<T extends { id: number; status?: string }>({
  rows, columns, statusOptions = [], onView, onEdit, onStatusChange, onDelete, archived = false, onRestore,
  deleteTitle = "O'chirishni tasdiqlaysizmi?", deleteDescription = "Ushbu element arxivga o'tkaziladi.",
}: {
  rows: T[];
  columns: EntityTableColumn<T>[];
  statusOptions?: StatusOption[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onStatusChange?: (row: T, status: string) => void;
  onDelete?: (row: T) => void;
  archived?: boolean;
  onRestore?: (row: T) => void;
  deleteTitle?: (row: T) => string;
  deleteDescription?: (row: T) => string;
}) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  return (
    <>
      <div className="erp-table-shell">
        <div className="erp-table-scroll">
          <table className="erp-students-table w-full">
            <thead><tr>
              <th className="w-10"><input type="checkbox" className="erp-checkbox" /></th>
              {columns.map((c) => <th key={c.key} className={c.className}>{c.label}</th>)}
              <th className="text-right">Amallar</th>
            </tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><input type="checkbox" className="erp-checkbox" /></td>
                  {columns.map((c) => <td key={c.key}>{c.render(row)}</td>)}
                  <td>
                    <div className="erp-row-actions">
                      {onView && <button title="Ko'rish" onClick={() => onView(row)} className="erp-action-btn erp-action-view"><Eye className="w-4 h-4" /></button>}
                      {!archived && onEdit && <button title="Tahrirlash" onClick={() => onEdit(row)} className="erp-action-btn erp-action-edit"><Pencil className="w-4 h-4" /></button>}
                      {!archived && onStatusChange && statusOptions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><button title="Status" className="erp-action-btn"><MoreHorizontal className="w-4 h-4" /></button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.map((opt) => <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(row, opt.value)} className="cursor-pointer"><span className={`w-2 h-2 rounded-full mr-2 ${opt.dot}`} />{opt.label}</DropdownMenuItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {archived && onRestore && <button title="Tiklash" onClick={() => onRestore(row)} className="erp-action-btn erp-action-view"><RotateCcw className="w-4 h-4" /></button>}
                      {onDelete && <button title={archived ? "Butunlay o'chirish" : "O'chirish"} onClick={() => setPendingDelete(row)} className="erp-action-btn erp-action-delete"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{pendingDelete ? (typeof deleteTitle === "function" ? deleteTitle(pendingDelete) : deleteTitle) : ""}</AlertDialogTitle><AlertDialogDescription>{pendingDelete ? (typeof deleteDescription === "function" ? deleteDescription(pendingDelete) : deleteDescription) : ""}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Bekor qilish</AlertDialogCancel><AlertDialogAction onClick={() => { if (pendingDelete && onDelete) onDelete(pendingDelete); setPendingDelete(null); }}>Tasdiqlash</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
