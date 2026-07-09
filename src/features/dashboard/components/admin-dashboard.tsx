import { AlertTriangle, Boxes, Package, PackageX } from "lucide-react";
import { getAdminDashboard } from "@/features/dashboard/queries";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { MovementChart } from "@/features/dashboard/components/movement-chart";
import { LowStockTable } from "@/features/dashboard/components/low-stock-table";
import { PageHeader } from "@/components/shared/page-header";

export async function AdminDashboard({ orgId }: { orgId: string }) {
  const data = await getAdminDashboard(orgId);

  return (
    <>
      <PageHeader title="ภาพรวมทั้งหมด" description="สรุปสถานะคลังสินค้าของคุณ" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="สินค้าทั้งหมด"
          value={data.totalProducts}
          suffix="รายการ"
          icon={Package}
          tone="blue"
        />
        <StatCard
          title="สินค้าคงเหลือ"
          value={data.inStockCount}
          suffix="รายการ"
          icon={Boxes}
          tone="green"
        />
        <StatCard
          title="สินค้าใกล้หมด"
          value={data.lowStockCount}
          suffix="รายการ"
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          title="สินค้าหมดสต็อก"
          value={data.outOfStockCount}
          suffix="รายการ"
          icon={PackageX}
          tone="red"
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MovementChart data={data.series} />
        </div>
        <LowStockTable products={data.lowStock} />
      </div>
    </>
  );
}
