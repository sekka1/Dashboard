import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  deactivated: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
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
