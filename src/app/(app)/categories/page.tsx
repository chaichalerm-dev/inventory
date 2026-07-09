import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getCategories } from "@/features/categories/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { NewCategoryButton } from "@/features/categories/components/new-category-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "หมวดหมู่สินค้า · Categories" };

export default async function CategoriesPage() {
  const { orgId } = await requireAdmin();
  const [categories, dict] = await Promise.all([
    getCategories(orgId),
    getLocale().then(getDictionary),
  ]);
  const t = dict.categories;

  return (
    <>
      <PageHeader title={t.title} description={t.desc}>
        <NewCategoryButton />
      </PageHeader>
      {categories.length === 0 ? (
        <EmptyState icon={Tags} title={t.noCategoriesYet} description={t.createFirstCategory}>
          <NewCategoryButton />
        </EmptyState>
      ) : (
        <CategoriesTable categories={categories} />
      )}
    </>
  );
}
