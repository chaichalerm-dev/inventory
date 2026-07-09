import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/features/settings/queries";
import { OrganizationSettingsForm } from "@/features/settings/components/organization-settings-form";
import { SystemSettingsForm } from "@/features/settings/components/system-settings-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "ตั้งค่าระบบ" };

export default async function SettingsPage() {
  const { orgId } = await requireAdmin();
  const [organization, systemSettings] = await Promise.all([
    prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { name: true },
    }),
    getSystemSettings(),
  ]);

  return (
    <>
      <PageHeader title="ตั้งค่าระบบ" description="จัดการข้อมูลองค์กรของคุณ" />
      <div className="space-y-4">
        <OrganizationSettingsForm organizationName={organization.name} />
        <SystemSettingsForm showLoginDemoAccounts={systemSettings.showLoginDemoAccounts} />
      </div>
    </>
  );
}
