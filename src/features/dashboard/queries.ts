import "server-only";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  productCount: number;
  categoryCount: number;
  lowStockCount: number;
  supplierCount: number;
};

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const [productCount, categoryCount, lowStockCount, supplierCount] =
    await prisma.$transaction([
      prisma.product.count({ where: { organizationId: orgId, isArchived: false } }),
      prisma.category.count({ where: { organizationId: orgId } }),
      prisma.product.count({
        where: {
          organizationId: orgId,
          isArchived: false,
          quantity: { lte: prisma.product.fields.minStock },
        },
      }),
      prisma.supplier.count({ where: { organizationId: orgId } }),
    ]);

  return { productCount, categoryCount, lowStockCount, supplierCount };
}
