import type { Metadata } from "next";
import { Package } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getProducts } from "@/features/products/queries";
import { getCategories } from "@/features/categories/queries";
import { ProductsTable } from "@/features/products/components/products-table";
import { NewProductButton } from "@/features/products/components/new-product-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const { orgId } = await requireSession();
  const [products, categories] = await Promise.all([
    getProducts(orgId),
    getCategories(orgId),
  ]);

  return (
    <>
      <PageHeader title="Products" description="Your product catalog and stock levels.">
        <NewProductButton categories={categories} />
      </PageHeader>
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start tracking inventory."
        >
          <NewProductButton categories={categories} />
        </EmptyState>
      ) : (
        <ProductsTable products={products} categories={categories} />
      )}
    </>
  );
}
