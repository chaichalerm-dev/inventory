"use client";

import { useOptimistic, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type { ProductRow } from "@/features/products/queries";
import type { CategoryRow } from "@/features/categories/queries";
import { deleteProductAction } from "@/features/products/actions";
import { ProductRowActions } from "@/features/products/components/product-row-actions";
import { StockBadge } from "@/features/products/components/stock-badge";
import { DataTable } from "@/components/shared/data-table";
import { formatMoney } from "@/lib/format";

type ProductsTableProps = {
  products: ProductRow[];
  categories: CategoryRow[];
  isAdmin: boolean;
};

export function ProductsTable({ products, categories, isAdmin }: ProductsTableProps) {
  const [, startTransition] = useTransition();
  const [optimisticProducts, removeProduct] = useOptimistic(
    products,
    (state, id: string) => state.filter((p) => p.id !== id),
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      removeProduct(id);
      const result = await deleteProductAction(id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Product deleted");
      }
    });
  }

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.categoryName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => (
        <StockBadge
          quantity={row.original.quantity}
          minStock={row.original.minStock}
          unit={row.original.unit}
        />
      ),
    },
    {
      accessorKey: "price",
      header: () => <span className="block text-right">Price</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">{formatMoney(row.original.price)}</span>
      ),
    },
    ...(isAdmin
      ? ([
          {
            id: "actions",
            cell: ({ row }) => (
              <div className="text-right">
                <ProductRowActions
                  product={row.original}
                  categories={categories}
                  onDelete={handleDelete}
                />
              </div>
            ),
          },
        ] satisfies ColumnDef<ProductRow>[])
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={optimisticProducts}
      filterColumn="name"
      filterPlaceholder="Filter products…"
    />
  );
}
