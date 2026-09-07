import { Link } from "react-router-dom";

interface Metric {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

const METRICS: Metric[] = [
  { label: "Referrals this month", value: "184", delta: "+12.4%", positive: true },
  { label: "Avg. days to close", value: "27", delta: "-3.1 days", positive: true },
  { label: "Conversion rate", value: "31%", delta: "+2.0pt", positive: true },
  { label: "Commission pipeline", value: "$412,900", delta: "-4.2%", positive: false },
];

const FUNNEL = [
  { stage: "Submitted", count: 184, width: 100 },
  { stage: "Contacted", count: 141, width: 77 },
  { stage: "In progress", count: 96, width: 52 },
  { stage: "Closed / won", count: 57, width: 31 },
];

const WEEKLY_VOLUME = [24, 31, 18, 40, 36, 52, 44, 61, 58, 47, 63, 70];

const TOP_PARTNERS = [
  { name: "Alicia Novak", region: "Austin, TX", closedWon: 14, commission: "$88,200" },
  { name: "Marcus Reid", region: "Denver, CO", closedWon: 11, commission: "$71,450" },
  { name: "Priya Chandran", region: "Raleigh, NC", closedWon: 9, commission: "$54,300" },
  { name: "Devon Blake", region: "Tampa, FL", closedWon: 8, commission: "$49,900" },
];

export function AnalyticsDemoPage() {
  const maxVolume = Math.max(...WEEKLY_VOLUME);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/demos"
          className="text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
        >
          ← All demos
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-400">
              Pipeline Pulse
            </p>
            <h1 className="mt-2 font-mono text-3xl font-semibold text-white">
              Referral operations, Q3
            </h1>
          </div>
          <p className="font-mono text-xs text-slate-500">Last synced 4 minutes ago</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-[#0b1120] p-5">
              <p className="text-xs text-slate-500">{metric.label}</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-white">{metric.value}</p>
              <p
                className={`mt-1 font-mono text-xs ${
                  metric.positive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {metric.delta} vs last month
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 lg:col-span-3">
            <h2 className="text-sm font-medium text-white">Weekly submission volume</h2>
            <div className="mt-6 flex h-40 items-end gap-2">
              {WEEKLY_VOLUME.map((value, i) => (
                <div key={i} className="group flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-emerald-500/70 transition-colors group-hover:bg-emerald-400"
                    style={{ height: `${(value / maxVolume) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Weeks 1–12, referrals submitted per week</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 lg:col-span-2">
            <h2 className="text-sm font-medium text-white">Funnel</h2>
            <div className="mt-6 space-y-4">
              {FUNNEL.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">{stage.stage}</span>
                    <span className="font-mono text-slate-300">{stage.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${stage.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-medium text-white">Top partners this quarter</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Partner</th>
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 font-medium">Closed / won</th>
                <th className="pb-2 font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PARTNERS.map((partner) => (
                <tr key={partner.name} className="border-b border-slate-800/60 last:border-0">
                  <td className="py-2.5 text-slate-200">{partner.name}</td>
                  <td className="py-2.5 text-slate-400">{partner.region}</td>
                  <td className="py-2.5 font-mono text-slate-300">{partner.closedWon}</td>
                  <td className="py-2.5 font-mono text-emerald-400">{partner.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
