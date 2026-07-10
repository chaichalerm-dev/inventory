"use client";

import { useOptimistic, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CupSoda } from "lucide-react";
import type { ProductRow } from "@/features/products/queries";
import type { CategoryRow } from "@/features/categories/queries";
import { deleteProductAction } from "@/features/products/actions";
import { ProductRowActions } from "@/features/products/components/product-row-actions";
import { StockBadge } from "@/features/products/components/stock-badge";
import { DataTable } from "@/components/shared/data-table";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/language-provider";

type ProductsTableProps = {
  products: ProductRow[];
  categories: CategoryRow[];
  isAdmin: boolean;
};

export function ProductsTable({ products, categories, isAdmin }: ProductsTableProps) {
  const { dict } = useLanguage();
  const t = dict.products;
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
        toast.success(t.productDeleted);
      }
    });
  }

  const columns: ColumnDef<ProductRow>[] = [
    {
      id: "photo",
      header: "",
      cell: ({ row }) => (
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {row.original.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <CupSoda className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: t.columnSku,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t.columnName,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "categoryName",
      header: t.columnCategory,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.categoryName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: t.columnStock,
      cell: ({ row }) => (
        <StockBadge
          quantity={row.original.quantity}
          minStock={row.original.minStock}
          unit={row.original.unit}
          outOfStockLabel={t.outOfStockBadge}
          lowLabel={t.lowBadge}
        />
      ),
    },
    {
      accessorKey: "price",
      header: () => <span className="block text-right">{t.columnPrice}</span>,
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
      filterPlaceholder={t.filterPlaceholder}
    />
  );
}
