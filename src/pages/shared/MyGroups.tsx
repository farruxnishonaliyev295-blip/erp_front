import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { groupsApi } from "@/api/services/groupsApi";
import { studentsApi } from "@/api/services/studentsApi";
import { profileApi } from "@/api/services/profileApi";
import GroupsTable, { type GroupRow } from "@/components/shared/GroupsTable";
import GroupTeachersModal from "@/components/teacher/GroupTeachersModal";
import type { PaginationQuery } from "@/api/types";

export default function MyGroups() {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const [tab, setTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [studentGroups, setStudentGroups] = useState<GroupRow[]>([]);
  const [teacherProfileId, setTeacherProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalGroup, setModalGroup] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isTeacher) {
      profileApi.me()
        .then((me) => {
          const tid = (me as unknown as { teacherProfile?: { id?: number } }).teacherProfile?.id ?? null;
          setTeacherProfileId(tid);
        })
        .catch((err) => {
          setError(err.message || "Profilni yuklashda xatolik");
          setLoading(false);
        });
    } else {
      studentsApi.my()
        .then((res) => {
          const p = res as { studentGroups?: Array<{ group: GroupRow }> };
          setStudentGroups((p.studentGroups || []).map((sg) => sg.group));
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Guruhlarni yuklashda xatolik");
          setLoading(false);
        });
    }
  }, [user?.id, isTeacher]);

  useEffect(() => {
    if (isTeacher) {
      if (teacherProfileId == null) return;
      setLoading(true);
      const q = { teacherId: teacherProfileId, status: tab, limit: 100 } as PaginationQuery;
      groupsApi.list(q)
        .then((res) => setGroups(res.items as GroupRow[]))
        .catch((err) => setError(err.message || "Guruhlarni yuklashda xatolik"))
        .finally(() => setLoading(false));
    } else {
      setGroups(studentGroups.filter((g) => g.status === tab));
    }
  }, [tab, teacherProfileId, studentGroups, isTeacher]);

  const basePath = isTeacher ? "/teacher/groups" : "/student/groups";

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Guruhlarim</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{groups.length} ta guruh</p>

      <div className="mt-5 flex items-center gap-6 border-b border-border">
        <TabButton active={tab === "ACTIVE"} onClick={() => setTab("ACTIVE")}>Faol</TabButton>
        <TabButton active={tab === "COMPLETED"} onClick={() => setTab("COMPLETED")}>Tugagan</TabButton>
      </div>

      <div className="mt-6">
        {loading && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && (
          <GroupsTable groups={groups} basePath={basePath} onTeachers={(g) => setModalGroup({ id: g.id, name: g.name })} />
        )}
      </div>

      <GroupTeachersModal
        open={modalGroup !== null}
        onOpenChange={(o) => { if (!o) setModalGroup(null); }}
        groupId={modalGroup?.id || 0}
        groupName={modalGroup?.name || ""}
      />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"pb-3 text-sm transition-colors " + (active ? "font-semibold text-foreground border-b-2 border-accent" : "font-medium text-muted-foreground hover:text-foreground")}
    >
      {children}
    </button>
  );
}
