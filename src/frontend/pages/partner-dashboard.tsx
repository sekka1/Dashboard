import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/stat-card";
import { ReferralForm } from "@/components/referral-form";
import { ReferralTable } from "@/components/referral-table";
import { apiClient } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { Referral } from "@/types";

export function PartnerDashboardPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.api.referrals.$get();
    if (res.ok) {
      const data = await res.json();
      setReferrals(data.referrals);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const totalSubmitted = referrals.length;
  const active = referrals.filter((r) => r.status === "in_progress").length;
  const closedWon = referrals.filter((r) => r.status === "closed_won").length;
  const totalCommission = referrals.reduce(
    (sum, r) => sum + (r.status === "closed_won" ? r.estimatedCommissionCents ?? 0 : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Partner Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/demos"
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              Explore design demos →
            </Link>
            <ReferralForm onCreated={fetchReferrals} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Referrals Submitted" value={totalSubmitted} />
          <StatCard label="Active Referrals" value={active} />
          <StatCard label="Closed Deals" value={closedWon} />
          <StatCard label="Total Commission Earned" value={formatCents(totalCommission)} />
        </div>
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <p className="p-6 text-slate-400">Loading…</p>
          ) : (
            <ReferralTable referrals={referrals} />
          )}
        </div>
      </div>
    </div>
  );
}
