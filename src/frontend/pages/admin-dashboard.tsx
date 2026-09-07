import { useCallback, useEffect, useState } from "react";
import { UserTable } from "@/components/user-table";
import { apiClient } from "@/lib/api";
import type { User, UpdateUserInput } from "@/types";

export function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    const res = await apiClient.api.admin.users.$get();
    if (res.ok) setUsers((await res.json()).users);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleUserUpdate(id: string, changes: UpdateUserInput) {
    await apiClient.api.admin.users[":id"].$patch({ param: { id }, json: changes });
    fetchUsers();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold">Admin Portal</h1>
        <div className="rounded-lg bg-white shadow">
          <UserTable users={users} onUpdate={handleUserUpdate} />
        </div>
      </div>
    </div>
  );
}
