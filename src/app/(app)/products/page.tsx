import type { Metadata } from "next";
import { Package } from "lucide-react";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { getProducts } from "@/features/products/queries";
import { getCategories } from "@/features/categories/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductsTable } from "@/features/products/components/products-table";
import { NewProductButton } from "@/features/products/components/new-product-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "สินค้า · Products" };

export default async function ProductsPage() {
  const { orgId, role } = await requireSession();
  const isAdmin = isAdminRole(role);
  const [products, categories, dict] = await Promise.all([
    getProducts(orgId),
    getCategories(orgId),
    getLocale().then(getDictionary),
  ]);
  const t = dict.products;

  return (
    <>
      <PageHeader
        title={isAdmin ? t.titleAdmin : t.titleUser}
        description={isAdmin ? t.descAdmin : t.descUser}
      >
        {isAdmin ? <NewProductButton categories={categories} /> : null}
      </PageHeader>
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t.noProductsYet}
          description={isAdmin ? t.addFirstProductAdmin : t.addFirstProductUser}
        >
          {isAdmin ? <NewProductButton categories={categories} /> : null}
        </EmptyState>
      ) : (
        <ProductsTable products={products} categories={categories} isAdmin={isAdmin} />
      )}
    </>
  );
}
