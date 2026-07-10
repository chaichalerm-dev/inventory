import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/features/settings/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { OrganizationSettingsForm } from "@/features/settings/components/organization-settings-form";
import { SystemSettingsForm } from "@/features/settings/components/system-settings-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "ตั้งค่าระบบ · Settings" };

export default async function SettingsPage() {
  const { orgId } = await requireAdmin();
  const [organization, systemSettings, dict] = await Promise.all([
    prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { name: true },
    }),
    getSystemSettings(),
    getLocale().then(getDictionary),
  ]);

  return (
    <>
      <PageHeader title={dict.settings.title} description={dict.settings.desc} />
      <div className="space-y-4">
        <OrganizationSettingsForm organizationName={organization.name} />
        <SystemSettingsForm
          showLoginDemoAccounts={systemSettings.showLoginDemoAccounts}
          logoUrl={systemSettings.logoUrl}
        />
      </div>
    </>
  );
}
