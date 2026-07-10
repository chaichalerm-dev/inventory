"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { MemberRow } from "@/features/users/queries";
import { MemberRowActions } from "@/features/users/components/member-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/language-provider";

type RoleGroup = "all" | "admin" | "user";

// OWNER is folded into the "admin" group — there's no separate tab for it,
// it's a single person by construction (the org creator).
function isInGroup(role: MemberRow["role"], group: RoleGroup): boolean {
  if (group === "all") return true;
  if (group === "admin") return role === "OWNER" || role === "ADMIN";
  return role === "MEMBER";
}

export function MembersTable({
  members,
  currentUserId,
}: {
  members: MemberRow[];
  currentUserId: string;
}) {
  const { dict, locale } = useLanguage();
  const [group, setGroup] = useState<RoleGroup>("all");

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

  const adminCount = members.filter((m) => isInGroup(m.role, "admin")).length;
  const userCount = members.filter((m) => isInGroup(m.role, "user")).length;
  const filtered = members.filter((m) => isInGroup(m.role, group));

  return (
    <div className="space-y-4">
      <Tabs value={group} onValueChange={(value) => setGroup(value as RoleGroup)}>
        <TabsList>
          <TabsTrigger value="all">
            {dict.users.tabAll} ({members.length})
          </TabsTrigger>
          <TabsTrigger value="admin">
            {dict.users.tabAdmins} ({adminCount})
          </TabsTrigger>
          <TabsTrigger value="user">
            {dict.users.tabUsers} ({userCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        data={filtered}
        filterColumn="name"
        filterPlaceholder={dict.users.searchPlaceholder}
      />
    </div>
  );
}
