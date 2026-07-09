import { AlertTriangle, Boxes, Package, PackageX } from "lucide-react";
import { getAdminDashboard } from "@/features/dashboard/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/types";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { MovementChart } from "@/features/dashboard/components/movement-chart";
import { LowStockTable } from "@/features/dashboard/components/low-stock-table";
import { PageHeader } from "@/components/shared/page-header";

export async function AdminDashboard({
  orgId,
  dict,
  locale,
}: {
  orgId: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const data = await getAdminDashboard(orgId, locale);
  const t = dict.dashboard.admin;

  return (
    <>
      <PageHeader title={t.title} description={t.description} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t.totalProducts}
          value={data.totalProducts}
          suffix={t.items}
          icon={Package}
          tone="blue"
        />
        <StatCard
          title={t.inStock}
          value={data.inStockCount}
          suffix={t.items}
          icon={Boxes}
          tone="green"
        />
        <StatCard
          title={t.lowStock}
          value={data.lowStockCount}
          suffix={t.items}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          title={t.outOfStock}
          value={data.outOfStockCount}
          suffix={t.items}
          icon={PackageX}
          tone="red"
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MovementChart
            data={data.series}
            title={t.movementChartTitle}
            seriesInLabel={t.seriesIn}
            seriesOutLabel={t.seriesOut}
          />
        </div>
        <LowStockTable
          products={data.lowStock}
          title={t.lowStockPanelTitle}
          viewAllLabel={t.viewAll}
          noLowStockLabel={t.noLowStock}
          outOfStockLabel={t.outOfStockBadge}
          lowLabel={t.lowBadge}
        />
      </div>
    </>
  );
}
