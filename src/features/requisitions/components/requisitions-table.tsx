"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { RequisitionRow } from "@/features/requisitions/queries";
import { RequisitionStatusBadge } from "@/features/requisitions/components/requisition-status-badge";
import { RequisitionRowActions } from "@/features/requisitions/components/requisition-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { formatDateThai } from "@/lib/format";

function itemsSummary(items: RequisitionRow["items"]): string {
  const first = items[0];
  if (!first) return "—";
  const head = `${first.productName} ×${first.quantity}`;
  return items.length > 1 ? `${head} +${items.length - 1} รายการ` : head;
}

type RequisitionsTableProps = {
  requisitions: RequisitionRow[];
  isAdmin: boolean;
};

export function RequisitionsTable({
  requisitions,
  isAdmin,
}: RequisitionsTableProps) {
  const columns: ColumnDef<RequisitionRow>[] = [
    {
      accessorKey: "reqNumber",
      header: "เลขที่เบิก",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.reqNumber}</span>
      ),
    },
    {
      id: "items",
      header: "สินค้า",
      cell: ({ row }) => (
        <span title={row.original.items
          .map((i) => `${i.productName} ×${i.quantity} ${i.unit}`)
          .join(", ")}
        >
          {itemsSummary(row.original.items)}
        </span>
      ),
    },
    ...(isAdmin
      ? ([
          {
            accessorKey: "requesterName",
            header: "ผู้เบิก",
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
      header: "วันที่เบิก",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateThai(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => <RequisitionStatusBadge status={row.original.status} />,
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
      filterPlaceholder="ค้นหาเลขที่เบิก…"
    />
  );
}
