import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getMembers } from "@/features/users/queries";
import { MembersTable } from "@/features/users/components/members-table";
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "จัดการผู้ใช้งาน" };

export default async function UsersPage() {
  const { orgId, userId } = await requireAdmin();
  const members = await getMembers(orgId);

  return (
    <>
      <PageHeader
        title="จัดการผู้ใช้งาน"
        description="เพิ่มผู้ใช้งานและกำหนดสิทธิ์การเข้าถึงระบบ"
      >
        <InviteUserDialog />
      </PageHeader>
      <MembersTable members={members} currentUserId={userId} />
    </>
  );
}
