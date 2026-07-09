import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { UserDashboard } from "@/features/dashboard/components/user-dashboard";

export const metadata: Metadata = { title: "แดชบอร์ด · Dashboard" };

export default async function DashboardPage() {
  const { orgId, userId, role } = await requireSession();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return isAdminRole(role) ? (
    <AdminDashboard orgId={orgId} dict={dict} locale={locale} />
  ) : (
    <UserDashboard orgId={orgId} userId={userId} dict={dict} locale={locale} />
  );
}
