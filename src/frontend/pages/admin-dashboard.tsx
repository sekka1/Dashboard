import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReferralTable } from "@/components/referral-table";
import { UserTable } from "@/components/user-table";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import type { Referral, User, UpdateReferralInput, UpdateUserInput } from "@/types";

export function AdminDashboardPage() {
  const [tab, setTab] = useState<"referrals" | "users">("referrals");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReferrals = useCallback(async () => {
    const res = await apiClient.api.referrals.$get();
    if (res.ok) setReferrals((await res.json()).referrals);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await apiClient.api.admin.users.$get();
    if (res.ok) setUsers((await res.json()).users);
  }, []);

  useEffect(() => {
    fetchReferrals();
    fetchUsers();
  }, [fetchReferrals, fetchUsers]);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const filteredReferrals = referrals.filter((r) => {
    const partnerName = usersById.get(r.partnerId)?.name ?? "";
    const matchesPartner = partnerName.toLowerCase().includes(partnerFilter.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesPartner && matchesStatus;
  });

  async function handleReferralUpdate(id: string, changes: UpdateReferralInput) {
    await apiClient.api.referrals[":id"].$patch({ param: { id }, json: changes });
    fetchReferrals();
  }

  async function handleUserUpdate(id: string, changes: UpdateUserInput) {
    await apiClient.api.admin.users[":id"].$patch({ param: { id }, json: changes });
    fetchUsers();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <Link
            to="/demos"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Explore design demos →
          </Link>
        </div>
        <div className="flex gap-2 border-b border-slate-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${tab === "referrals" ? "border-b-2 border-slate-900" : "text-slate-500"}`}
            onClick={() => setTab("referrals")}
          >
            Referral Management
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${tab === "users" ? "border-b-2 border-slate-900" : "text-slate-500"}`}
            onClick={() => setTab("users")}
          >
            User Management
          </button>
        </div>

        {tab === "referrals" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Filter by partner name"
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
              />
              <select
                className="rounded-md border border-slate-300 px-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="submitted">Submitted</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed_won">Closed/Won</option>
                <option value="closed_lost">Closed/Lost</option>
              </select>
            </div>
            <div className="rounded-lg bg-white shadow">
              <ReferralTable
                referrals={filteredReferrals}
                isAdmin
                onUpdate={handleReferralUpdate}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow">
            <UserTable users={users} onUpdate={handleUserUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}
