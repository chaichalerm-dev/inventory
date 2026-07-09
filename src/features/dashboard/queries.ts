import "server-only";
import { prisma } from "@/lib/prisma";
import type { RequisitionStatus } from "@/generated/prisma/enums";

export type MovementPoint = {
  /** Preformatted Thai short date, e.g. "1 ก.ค." — the chart is display-only. */
  label: string;
  in: number;
  out: number;
};

export type LowStockProduct = {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
};

export type AdminDashboardData = {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  series: MovementPoint[];
  lowStock: LowStockProduct[];
};

const dayLabelFormat = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
});

// Local-time day key so movements land on the day the user perceives.
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export async function getAdminDashboard(
  orgId: string,
): Promise<AdminDashboardData> {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [totalProducts, outOfStockCount, lowStockCount, movements, lowStock] =
    await Promise.all([
      prisma.product.count({
        where: { organizationId: orgId, isArchived: false },
      }),
      prisma.product.count({
        where: { organizationId: orgId, isArchived: false, quantity: 0 },
      }),
      prisma.product.count({
        where: {
          organizationId: orgId,
          isArchived: false,
          quantity: { gt: 0, lte: prisma.product.fields.minStock },
        },
      }),
      prisma.stockMovement.findMany({
        where: {
          organizationId: orgId,
          createdAt: { gte: since },
          type: { in: ["IN", "OUT"] },
        },
        select: { type: true, delta: true, createdAt: true },
      }),
      prisma.product.findMany({
        where: {
          organizationId: orgId,
          isArchived: false,
          quantity: { lte: prisma.product.fields.minStock },
        },
        orderBy: { quantity: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          quantity: true,
          minStock: true,
          unit: true,
        },
      }),
    ]);

  const series: MovementPoint[] = [];
  const indexByDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    indexByDay.set(dayKey(day), series.length);
    series.push({ label: dayLabelFormat.format(day), in: 0, out: 0 });
  }
  for (const movement of movements) {
    const index = indexByDay.get(dayKey(movement.createdAt));
    if (index === undefined) continue;
    const point = series[index];
    if (!point) continue;
    if (movement.type === "IN") point.in += movement.delta;
    else point.out += Math.abs(movement.delta);
  }

  return {
    totalProducts,
    inStockCount: totalProducts - outOfStockCount,
    lowStockCount,
    outOfStockCount,
    series,
    lowStock,
  };
}

export type RecentRequisition = {
  id: string;
  reqNumber: string;
  status: RequisitionStatus;
  createdAt: string;
  summary: string;
};

export type UserDashboardData = {
  total: number;
  pending: number;
  approved: number;
  returned: number;
  recent: RecentRequisition[];
};

export async function getUserDashboard(
  orgId: string,
  userId: string,
): Promise<UserDashboardData> {
  const where = { organizationId: orgId, requesterId: userId };

  const [byStatus, recentRows] = await Promise.all([
    prisma.requisition.groupBy({ by: ["status"], where, _count: true }),
    prisma.requisition.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const counts = new Map(byStatus.map((row) => [row.status, row._count]));
  const count = (status: RequisitionStatus) => counts.get(status) ?? 0;

  return {
    total: [...counts.values()].reduce((sum, n) => sum + n, 0),
    pending: count("PENDING"),
    // Items out in the field: approved plus those awaiting return pickup.
    approved: count("APPROVED") + count("RETURN_REQUESTED"),
    returned: count("RETURNED"),
    recent: recentRows.map((r) => {
      const first = r.items[0];
      const head = first
        ? `${first.product.name} ×${first.quantity}`
        : "—";
      return {
        id: r.id,
        reqNumber: r.reqNumber,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        summary:
          r.items.length > 1 ? `${head} +${r.items.length - 1} รายการ` : head,
      };
    }),
  };
}
