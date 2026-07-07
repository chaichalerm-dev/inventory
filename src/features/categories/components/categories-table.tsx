"use client";

import { useOptimistic, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type { CategoryRow } from "@/features/categories/queries";
import { deleteCategoryAction } from "@/features/categories/actions";
import { CategoryRowActions } from "@/features/categories/components/category-row-actions";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [, startTransition] = useTransition();
  // Optimistic UI: the row disappears immediately; if the action fails the
  // transition ends without revalidation and React restores the real state.
  const [optimisticCategories, removeCategory] = useOptimistic(
    categories,
    (state, id: string) => state.filter((c) => c.id !== id),
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      removeCategory(id);
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
      }
    });
  }

  const columns: ColumnDef<CategoryRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description ?? "—"}</span>
      ),
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => <Badge variant="secondary">{row.original.productCount}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <CategoryRowActions category={row.original} onDelete={handleDelete} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={optimisticCategories}
      filterColumn="name"
      filterPlaceholder="Filter categories…"
    />
  );
}
