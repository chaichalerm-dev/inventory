import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getCategories } from "@/features/categories/queries";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { NewCategoryButton } from "@/features/categories/components/new-category-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "หมวดหมู่สินค้า" };

export default async function CategoriesPage() {
  const { orgId } = await requireAdmin();
  const categories = await getCategories(orgId);

  return (
    <>
      <PageHeader title="หมวดหมู่สินค้า" description="จัดกลุ่มสินค้าในคลังของคุณ">
        <NewCategoryButton />
      </PageHeader>
      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="ยังไม่มีหมวดหมู่"
          description="สร้างหมวดหมู่แรกเพื่อเริ่มจัดกลุ่มสินค้า"
        >
          <NewCategoryButton />
        </EmptyState>
      ) : (
        <CategoriesTable categories={categories} />
      )}
    </>
  );
}
