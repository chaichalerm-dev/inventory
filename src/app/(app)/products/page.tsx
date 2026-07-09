import type { Metadata } from "next";
import { Package } from "lucide-react";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { getProducts } from "@/features/products/queries";
import { getCategories } from "@/features/categories/queries";
import { ProductsTable } from "@/features/products/components/products-table";
import { NewProductButton } from "@/features/products/components/new-product-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "สินค้า" };

export default async function ProductsPage() {
  const { orgId, role } = await requireSession();
  const isAdmin = isAdminRole(role);
  const [products, categories] = await Promise.all([
    getProducts(orgId),
    getCategories(orgId),
  ]);

  return (
    <>
      <PageHeader
        title={isAdmin ? "จัดการสินค้า" : "รายการสินค้า"}
        description={
          isAdmin
            ? "แคตตาล็อกสินค้าและระดับสต็อกทั้งหมด"
            : "ค้นหาสินค้าและตรวจสอบสต็อกคงเหลือ"
        }
      >
        {isAdmin ? <NewProductButton categories={categories} /> : null}
      </PageHeader>
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="ยังไม่มีสินค้า"
          description={
            isAdmin
              ? "เพิ่มสินค้าแรกเพื่อเริ่มติดตามคลังสินค้า"
              : "ยังไม่มีสินค้าในระบบ"
          }
        >
          {isAdmin ? <NewProductButton categories={categories} /> : null}
        </EmptyState>
      ) : (
        <ProductsTable products={products} categories={categories} isAdmin={isAdmin} />
      )}
    </>
  );
}
