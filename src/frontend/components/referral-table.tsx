import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import { formatCents } from "@/lib/utils";
import type { Referral, UpdateReferralInput } from "@/types";

const STATUSES = ["submitted", "contacted", "in_progress", "closed_won", "closed_lost"] as const;

const columnHelper = createColumnHelper<Referral>();

export function ReferralTable({
  referrals,
  isAdmin,
  onUpdate,
}: {
  referrals: Referral[];
  isAdmin?: boolean;
  onUpdate?: (id: string, changes: UpdateReferralInput) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("clientName", { header: "Client" }),
      columnHelper.accessor("clientEmail", {
        header: "Email",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) =>
          isAdmin && onUpdate ? (
            <select
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              value={info.getValue()}
              onChange={(e) =>
                onUpdate(info.row.original.id, { status: e.target.value as Referral["status"] })
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge status={info.getValue()} />
          ),
      }),
      columnHelper.accessor("dealValueCents", {
        header: "Deal Value",
        cell: (info) => formatCents(info.getValue()),
      }),
      columnHelper.accessor("estimatedCommissionCents", {
        header: "Commission",
        cell: (info) => formatCents(info.getValue()),
      }),
    ],
    [isAdmin, onUpdate],
  );

  const table = useReactTable({ data: referrals, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <table className="w-full text-left text-sm">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-slate-200">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-3 py-2 font-medium text-slate-500">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-slate-100">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-3 py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        {referrals.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-400">
              No referrals yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
