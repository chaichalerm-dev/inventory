import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { UserDashboard } from "@/features/dashboard/components/user-dashboard";

export const metadata: Metadata = { title: "แดชบอร์ด" };

export default async function DashboardPage() {
  const { orgId, userId, role } = await requireSession();

  return isAdminRole(role) ? (
    <AdminDashboard orgId={orgId} />
  ) : (
    <UserDashboard orgId={orgId} userId={userId} />
  );
}
