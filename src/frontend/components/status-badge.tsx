import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  deactivated: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  contacted: "Contacted",
  in_progress: "In Progress",
  closed_won: "Closed/Won",
  closed_lost: "Closed/Lost",
  active: "Active",
  pending: "Pending",
  deactivated: "Deactivated",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
