import React, { useEffect, useState } from "react";
import { DoorOpen, Users2 } from "lucide-react";
import PageHeader, { type FilterOption } from "@/components/ui/PageHeader";
import EntityCard, { type StatusOption } from "@/components/ui/EntityCard";
import { StatusBadge } from "@/pages/admin/AdminDashboard";
import { roomsApi, type Room } from "@/api/services/roomsApi";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TablePagination from "@/components/ui/TablePagination";
import EntityTable from "@/components/ui/EntityTable";

const ROOM_STATUS_OPTIONS: FilterOption[] = [
  { label: "Faol", value: "ACTIVE" },
  { label: "Nofaol", value: "INACTIVE" },
];

const ROOM_STATUS_ACTIONS: StatusOption[] = [
  { value: "ACTIVE", label: "Faol", dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Nofaol", dot: "bg-slate-400" },
];

export default function Rooms() {
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [viewRoom, setViewRoom] = useState<Room | null>(null);

  const loadRooms = () => {
    setLoading(true);
    roomsApi
      .list({ page, limit, status: statusFilter || undefined })
      .then((res) => {
        setRoomList(res.items);
        if (res.meta) {
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      })
      .catch((err) => setError(err.message || "Xonalarni yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(loadRooms, [page, limit, statusFilter]);

  const addRoom = (values: Record<string, string>) => {
    if (!values.name?.trim() || !values.capacity) return;
    if (editRoom) {
      // Edit mode
      roomsApi
        .update(editRoom.id, { name: values.name.trim(), capacity: Number(values.capacity) })
        .then(() => { loadRooms(); setEditRoom(null); })
        .catch((err) => setError(err.message || "Xonani tahrirlashda xatolik"));
    } else {
      roomsApi
        .create(values.name.trim(), Number(values.capacity))
        .then(loadRooms)
        .catch((err) => setError(err.message || "Xona yaratishda xatolik"));
    }
  };

  const updateStatus = (room: Room, status: string) => {
    roomsApi
      .update(room.id, { status })
      .then(() => setRoomList((prev) => prev.map((r) => (r.id === room.id ? { ...r, status } : r))))
      .catch((err) => setError(err.message || "Statusni yangilashda xatolik"));
  };

  const deleteRoom = (room: Room) => {
    roomsApi
      .remove(room.id)
      .then(loadRooms)
      .catch((err) => setError(err.message || "Xonani o'chirishda xatolik"));
  };

  return (
    <div>
      <PageHeader
        title="Xonalar"
        subtitle={`${total || roomList.length} ta xona`}
        actionLabel="Yangi xona"
        onAction={() => setOpen(true)}
        filterOptions={ROOM_STATUS_OPTIONS}
        filterValue={statusFilter}
        onFilterChange={(val) => { setStatusFilter(val); setPage(1); }}
      />

      {loading && <p className="mb-4 text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <EntityTable
        rows={roomList}
        statusOptions={ROOM_STATUS_ACTIONS}
        onView={(r) => setViewRoom(r)}
        onEdit={(r) => { setEditRoom(r); setOpen(true); }}
        onStatusChange={updateStatus}
        onDelete={deleteRoom}
        deleteTitle={(r) => `"${r.name}" xonasini o'chirish`}
        deleteDescription={() => "Ushbu xonani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi."}
        columns={[
          { key: "name", label: "Xona nomi", render: (r) => <button className="erp-person-cell" onClick={() => setViewRoom(r)}><span className="erp-person-avatar erp-person-initials"><DoorOpen className="w-5 h-5" /></span><span><strong>{r.name}</strong><small>O'quv xonasi</small></span></button> },
          { key: "capacity", label: "Sig'im", render: (r) => <span>{r.capacity} o'rin</span> },
          { key: "schedules", label: "Jadval", render: (r) => <span>{r._count?.schedules || 0} ta</span> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      {!loading && roomList.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Hech qanday xona topilmadi.
        </p>
      )}

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <AdminFormDrawer
        kind="room"
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditRoom(null); }}
        onSubmit={addRoom}
        initialValues={editRoom ? { name: editRoom.name, capacity: String(editRoom.capacity) } : undefined}
      />

      {/* View Modal */}
      <Dialog open={!!viewRoom} onOpenChange={(o) => !o && setViewRoom(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border border-border bg-card">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="font-heading text-lg font-bold">
              Umumiy ma'lumot
            </DialogTitle>
          </DialogHeader>
          {viewRoom && (
            <div className="p-6 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl navy-gradient flex items-center justify-center">
                  <DoorOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{viewRoom.name}</h3>
                  <p className="text-sm text-muted-foreground">O'quv xonasi</p>
                </div>
                <div className="ml-auto"><StatusBadge status={viewRoom.status} /></div>
              </div>
              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sig'imi</span>
                  <span className="font-medium">{viewRoom.capacity} o'rin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jadval bandligi</span>
                  <span className="font-medium">{viewRoom._count?.schedules || 0} ta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={viewRoom.status} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
