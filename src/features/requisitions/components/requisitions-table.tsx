"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { RequisitionRow } from "@/features/requisitions/queries";
import { RequisitionStatusBadge } from "@/features/requisitions/components/requisition-status-badge";
import { RequisitionRowActions } from "@/features/requisitions/components/requisition-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate, type Dictionary } from "@/lib/i18n/get-dictionary";

function itemsSummary(items: RequisitionRow["items"], dict: Dictionary): string {
  const first = items[0];
  if (!first) return "—";
  const head = `${first.productName} ×${first.quantity}`;
  return items.length > 1
    ? `${head} ${interpolate(dict.requisitions.itemsMore, { count: items.length - 1 })}`
    : head;
}

type RequisitionsTableProps = {
  requisitions: RequisitionRow[];
  isAdmin: boolean;
};

export function RequisitionsTable({
  requisitions,
  isAdmin,
}: RequisitionsTableProps) {
  const { dict, locale } = useLanguage();
  const t = dict.requisitions;

  const columns: ColumnDef<RequisitionRow>[] = [
    {
      accessorKey: "reqNumber",
      header: t.columnReqNumber,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.reqNumber}</span>
      ),
    },
    {
      id: "items",
      header: t.columnProducts,
      cell: ({ row }) => (
        <span title={row.original.items
          .map((i) => `${i.productName} ×${i.quantity} ${i.unit}`)
          .join(", ")}
        >
          {itemsSummary(row.original.items, dict)}
        </span>
      ),
    },
    ...(isAdmin
      ? ([
          {
            accessorKey: "requesterName",
            header: t.columnRequester,
            cell: ({ row }) => (
              <span className="text-muted-foreground">
                {row.original.requesterName}
              </span>
            ),
          },
        ] satisfies ColumnDef<RequisitionRow>[])
      : []),
    {
      accessorKey: "createdAt",
      header: t.columnDate,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt, locale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t.columnStatus,
      cell: ({ row }) => (
        <RequisitionStatusBadge status={row.original.status} dict={dict} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RequisitionRowActions requisition={row.original} isAdmin={isAdmin} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requisitions}
      filterColumn="reqNumber"
      filterPlaceholder={t.searchPlaceholder}
    />
  );
}
