import type { Metadata } from "next";
import { AlertTriangle, Package, Tags, Truck } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getDashboardStats } from "@/features/dashboard/queries";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { orgId } = await requireSession();
  const stats = await getDashboardStats(orgId);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your inventory." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={stats.productCount} icon={Package} />
        <StatCard title="Categories" value={stats.categoryCount} icon={Tags} />
        <StatCard
          title="Low stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          emphasis="warning"
        />
        <StatCard title="Suppliers" value={stats.supplierCount} icon={Truck} />
      </div>
    </>
  );
}
