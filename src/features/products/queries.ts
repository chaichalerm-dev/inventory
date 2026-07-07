import "server-only";
import { prisma } from "@/lib/prisma";

// Serializable row for client components: Prisma Decimal → number here,
// because Decimal instances cannot cross the RSC boundary.
export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  minStock: number;
  price: number;
  costPrice: number;
  categoryId: string | null;
  categoryName: string | null;
};

export async function getProducts(orgId: string): Promise<ProductRow[]> {
  const products = await prisma.product.findMany({
    where: { organizationId: orgId, isArchived: false },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    unit: p.unit,
    quantity: p.quantity,
    minStock: p.minStock,
    price: p.price.toNumber(),
    costPrice: p.costPrice.toNumber(),
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
  }));
}
