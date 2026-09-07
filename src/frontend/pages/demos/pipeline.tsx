import { Link } from "react-router-dom";

interface Card {
  client: string;
  partner: string;
  value: string;
}

interface Column {
  stage: string;
  accent: string;
  cards: Card[];
}

const COLUMNS: Column[] = [
  {
    stage: "Submitted",
    accent: "border-t-slate-400",
    cards: [
      { client: "T. Whitfield", partner: "Alicia Novak", value: "$412,000" },
      { client: "J. Okafor", partner: "Sofia Ibarra", value: "$298,500" },
      { client: "M. Delgado", partner: "Renee Vasquez", value: "$355,000" },
    ],
  },
  {
    stage: "Contacted",
    accent: "border-t-sky-400",
    cards: [
      { client: "R. Blackwood", partner: "Marcus Reid", value: "$521,000" },
      { client: "C. Nakamura", partner: "Priya Chandran", value: "$389,900" },
    ],
  },
  {
    stage: "In progress",
    accent: "border-t-amber-400",
    cards: [
      { client: "S. Farouk", partner: "Devon Blake", value: "$614,200" },
      { client: "L. Petrova", partner: "Nathaniel Cho", value: "$275,000" },
      { client: "A. Grimaldi", partner: "Owen Fitzgerald", value: "$448,750" },
    ],
  },
  {
    stage: "Closed / won",
    accent: "border-t-[#ff5a36]",
    cards: [
      { client: "D. Hutchins", partner: "Alicia Novak", value: "$702,000" },
      { client: "K. Emerson", partner: "Marcus Reid", value: "$467,300" },
    ],
  },
];

export function PipelineDemoPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/demos"
          className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-200 hover:underline"
        >
          ← All demos
        </Link>

        <div className="mt-6 flex items-end justify-between border-b border-neutral-800 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#ff5a36]">
              Deal Board
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Referral pipeline</h1>
          </div>
          <p className="text-sm text-neutral-500">
            {COLUMNS.reduce((sum, col) => sum + col.cards.length, 0)} active deals
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.stage}>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-neutral-300">{column.stage}</h2>
                <span className="text-xs text-neutral-600">{column.cards.length}</span>
              </div>
              <div className="mt-3 space-y-3">
                {column.cards.map((card) => (
                  <div
                    key={card.client}
                    className={`rounded-lg border-t-2 bg-neutral-900 p-4 shadow-sm ${column.accent}`}
                  >
                    <p className="font-medium text-white">{card.client}</p>
                    <p className="mt-1 text-xs text-neutral-500">via {card.partner}</p>
                    <p className="mt-3 font-mono text-sm text-neutral-300">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
