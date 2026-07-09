"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { MemberRow } from "@/features/users/queries";
import { MemberRowActions } from "@/features/users/components/member-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/language-provider";

export function MembersTable({
  members,
  currentUserId,
}: {
  members: MemberRow[];
  currentUserId: string;
}) {
  const { dict, locale } = useLanguage();

  const columns: ColumnDef<MemberRow>[] = [
    {
      accessorKey: "name",
      header: dict.users.fullName,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name}
          {row.original.userId === currentUserId ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {dict.common.you}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: dict.users.email,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: dict.users.joinedAt,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt, locale)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">{dict.users.permission}</span>,
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
      filterPlaceholder={dict.users.searchPlaceholder}
    />
  );
}
