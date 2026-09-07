import { Link } from "react-router-dom";

interface Partner {
  name: string;
  region: string;
  focus: string;
  since: string;
  activeReferrals: number;
}

const PARTNERS: Partner[] = [
  { name: "Alicia Novak", region: "Austin, TX", focus: "Residential resale", since: "2021", activeReferrals: 9 },
  { name: "Marcus Reid", region: "Denver, CO", focus: "New construction", since: "2020", activeReferrals: 7 },
  { name: "Priya Chandran", region: "Raleigh, NC", focus: "Relocation", since: "2022", activeReferrals: 6 },
  { name: "Devon Blake", region: "Tampa, FL", focus: "Luxury / waterfront", since: "2019", activeReferrals: 5 },
  { name: "Sofia Ibarra", region: "Boise, ID", focus: "First-time buyers", since: "2023", activeReferrals: 8 },
  { name: "Nathaniel Cho", region: "Charlotte, NC", focus: "Investment properties", since: "2021", activeReferrals: 4 },
  { name: "Renee Vasquez", region: "Phoenix, AZ", focus: "Residential resale", since: "2022", activeReferrals: 6 },
  { name: "Owen Fitzgerald", region: "Portland, OR", focus: "Relocation", since: "2020", activeReferrals: 3 },
];

export function TeamDemoPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/demos"
          className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          ← All demos
        </Link>

        <div className="mt-6 border-b-2 border-neutral-900 pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
            Partner Directory — Vol. 04
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Referral Network Roster</h1>
        </div>

        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-3 pr-4 font-medium">Partner</th>
              <th className="py-3 pr-4 font-medium">Region</th>
              <th className="py-3 pr-4 font-medium">Focus</th>
              <th className="py-3 pr-4 font-medium">Partner since</th>
              <th className="py-3 font-medium text-right">Active referrals</th>
            </tr>
          </thead>
          <tbody>
            {PARTNERS.map((partner, i) => (
              <tr
                key={partner.name}
                className={`border-b border-neutral-200 ${i % 2 === 1 ? "bg-neutral-50" : ""}`}
              >
                <td className="py-3 pr-4 font-medium">{partner.name}</td>
                <td className="py-3 pr-4 text-neutral-600">{partner.region}</td>
                <td className="py-3 pr-4 text-neutral-600">{partner.focus}</td>
                <td className="py-3 pr-4 text-neutral-600">{partner.since}</td>
                <td className="py-3 text-right font-medium tabular-nums">
                  {partner.activeReferrals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-xs text-neutral-500">
          {PARTNERS.length} partners currently active across {new Set(PARTNERS.map((p) => p.region)).size}{" "}
          regions.
        </p>
      </div>
    </div>
  );
}
