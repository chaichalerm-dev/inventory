"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { MemberRow } from "@/features/users/queries";
import { MemberRowActions } from "@/features/users/components/member-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { formatDateThai } from "@/lib/format";

export function MembersTable({
  members,
  currentUserId,
}: {
  members: MemberRow[];
  currentUserId: string;
}) {
  const columns: ColumnDef<MemberRow>[] = [
    {
      accessorKey: "name",
      header: "ชื่อ-นามสกุล",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name}
          {row.original.userId === currentUserId ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (คุณ)
            </span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "อีเมล",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "เข้าร่วมเมื่อ",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateThai(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">สิทธิ์การใช้งาน</span>,
      cell: ({ row }) => (
        <MemberRowActions
          member={row.original}
          isSelf={row.original.userId === currentUserId}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={members}
      filterColumn="name"
      filterPlaceholder="ค้นหาชื่อผู้ใช้งาน…"
    />
  );
}
