import "server-only";
import { prisma } from "@/lib/prisma";

// Plain serializable shape handed to client components — never leak
// Prisma entities across the server/client boundary.
export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
};

export async function getCategories(orgId: string): Promise<CategoryRow[]> {
  const categories = await prisma.category.findMany({
    where: { organizationId: orgId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    productCount: c._count.products,
  }));
}
