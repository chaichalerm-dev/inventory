"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ProductRow } from "@/features/products/queries";
import type { CategoryRow } from "@/features/categories/queries";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProductRowActionsProps = {
  product: ProductRow;
  categories: CategoryRow[];
  onDelete: (id: string) => void;
};

export function ProductRowActions({ product, categories, onDelete }: ProductRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${product.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
        categories={categories}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${product.name}"?`}
        description="Products with stock history cannot be deleted and will be kept."
        onConfirm={() => onDelete(product.id)}
      />
    </>
  );
}
