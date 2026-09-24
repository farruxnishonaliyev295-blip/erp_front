import { useNavigate } from "react-router-dom";
import { formatDate, initialsOf } from "@/lib/format";

export type GroupRow = {
  id: number;
  name: string;
  status: string;
  startDate?: string | null;
  course?: { id: number; name: string } | null;
  groupTeachers?: Array<{
    role?: string;
    teacher?: { user?: { firstName?: string; lastName?: string } };
  }>;
};

export default function GroupsTable({ groups, basePath, onTeachers }: {
  groups: GroupRow[];
  basePath: string;
  onTeachers: (group: GroupRow) => void;
}) {
  const navigate = useNavigate();

  if (groups.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Guruh topilmadi.</p>;
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-6 py-3.5 font-medium w-10">#</th>
              <th className="px-6 py-3.5 font-medium">Guruh nomi</th>
              <th className="px-6 py-3.5 font-medium">Yo'nalishi</th>
              <th className="px-6 py-3.5 font-medium">O'qituvchi</th>
              <th className="px-6 py-3.5 font-medium">Boshlash vaqti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((g, i) => {
              const teachers = g.groupTeachers || [];
              const first = teachers[0]?.teacher?.user;
              return (
                <tr key={g.id} onClick={() => navigate(basePath + "/" + g.id)} className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-6 py-3.5 font-semibold">{g.name}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{g.course?.name || "—"}</td>
                  <td className="px-6 py-3.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onTeachers(g); }}
                      className="flex items-center gap-2"
                    >
                      {teachers.length > 0 ? (
                        <>
                          <span className="w-9 h-9 rounded-full accent-gradient text-white text-xs font-bold flex items-center justify-center">
                            {initialsOf(first?.firstName, first?.lastName)}
                          </span>
                          {teachers.length > 1 && (
                            <span className="text-xs font-semibold text-muted-foreground">+{teachers.length - 1}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Biriktirilmagan</span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{formatDate(g.startDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
