import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getMembers } from "@/features/users/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { MembersTable } from "@/features/users/components/members-table";
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "จัดการผู้ใช้งาน · Manage Users" };

export default async function UsersPage() {
  const { orgId, userId } = await requireAdmin();
  const [members, dict] = await Promise.all([
    getMembers(orgId),
    getLocale().then(getDictionary),
  ]);

  return (
    <>
      <PageHeader title={dict.users.title} description={dict.users.desc}>
        <InviteUserDialog />
      </PageHeader>
      <MembersTable members={members} currentUserId={userId} />
    </>
  );
}
