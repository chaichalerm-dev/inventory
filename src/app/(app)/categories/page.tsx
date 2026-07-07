import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getCategories } from "@/features/categories/queries";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { NewCategoryButton } from "@/features/categories/components/new-category-button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { orgId } = await requireSession();
  const categories = await getCategories(orgId);

  return (
    <>
      <PageHeader title="Categories" description="Organize products into groups.">
        <NewCategoryButton />
      </PageHeader>
      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create your first category to start organizing products."
        >
          <NewCategoryButton />
        </EmptyState>
      ) : (
        <CategoriesTable categories={categories} />
      )}
    </>
  );
}
