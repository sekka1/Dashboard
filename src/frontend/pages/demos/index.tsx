import { Link } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

interface DemoEntry {
  href: string;
  kind: string;
  title: string;
  description: string;
  swatch: string;
}

const DEMOS: DemoEntry[] = [
  {
    href: "/demos/analytics",
    kind: "Dashboard",
    title: "Pipeline Pulse",
    description:
      "A dark, data-dense ops dashboard tracking referral volume, conversion velocity, and commission trends.",
    swatch: "bg-[#0b1120] ring-1 ring-emerald-400/40",
  },
  {
    href: "/demos/listings",
    kind: "Grid",
    title: "Featured Listings",
    description:
      "A warm, editorial property grid for showcasing homes referred through the portal — built for browsing, not spreadsheets.",
    swatch: "bg-[#f6efe4] ring-1 ring-[#b5651d]/40",
  },
  {
    href: "/demos/team",
    kind: "Directory",
    title: "Partner Directory",
    description:
      "A broadsheet-style roster of partner agents with hairline rules and dense, scannable columns.",
    swatch: "bg-white ring-1 ring-neutral-900/20",
  },
  {
    href: "/demos/pipeline",
    kind: "Board",
    title: "Deal Board",
    description:
      "A kanban view of referrals moving from submitted to closed, for teams who think in columns, not lists.",
    swatch: "bg-[#141414] ring-1 ring-[#ff5a36]/50",
  },
];

export function DemosIndexPage() {
  const { data: session } = useSession();
  const homeHref = (session?.user as { role?: string } | undefined)?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          to={homeHref}
          className="text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Design lab
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
          Four takes on the same data.
        </h1>
        <p className="mt-4 max-w-xl text-slate-400">
          Each demo below reimagines referral and listing data with its own layout, palette, and
          typography — proof that a boilerplate doesn&apos;t have to look like one.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {DEMOS.map((demo) => (
            <Link
              key={demo.href}
              to={demo.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-slate-600 hover:bg-slate-900"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className={`h-8 w-8 rounded-md ${demo.swatch}`} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {demo.kind}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{demo.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{demo.description}</p>
              </div>
              <span className="mt-6 text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                View demo →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
