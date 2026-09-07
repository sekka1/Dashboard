import { StatusBadge } from "@/components/status-badge";
import type { User, UpdateUserInput } from "@/types";

const ROLES = ["partner", "admin"] as const;
const STATUSES = ["pending", "active", "deactivated"] as const;

export function UserTable({
  users,
  onUpdate,
}: {
  users: User[];
  onUpdate: (id: string, changes: UpdateUserInput) => void;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-3 py-2 font-medium text-slate-500">Name</th>
          <th className="px-3 py-2 font-medium text-slate-500">Email</th>
          <th className="px-3 py-2 font-medium text-slate-500">Role</th>
          <th className="px-3 py-2 font-medium text-slate-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-slate-100">
            <td className="px-3 py-2">{user.name}</td>
            <td className="px-3 py-2">{user.email}</td>
            <td className="px-3 py-2">
              <select
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={user.role}
                onChange={(e) => onUpdate(user.id, { role: e.target.value as User["role"] })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-3 py-2">
              <select
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={user.status}
                onChange={(e) => onUpdate(user.id, { status: e.target.value as User["status"] })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="ml-2">
                <StatusBadge status={user.status} />
              </span>
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr>
            <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
              No users yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
