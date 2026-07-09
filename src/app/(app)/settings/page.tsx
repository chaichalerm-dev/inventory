import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrganizationSettingsForm } from "@/features/settings/components/organization-settings-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "ตั้งค่าระบบ" };

export default async function SettingsPage() {
  const { orgId } = await requireAdmin();
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { name: true },
  });

  return (
    <>
      <PageHeader title="ตั้งค่าระบบ" description="จัดการข้อมูลองค์กรของคุณ" />
      <OrganizationSettingsForm organizationName={organization.name} />
    </>
  );
}
