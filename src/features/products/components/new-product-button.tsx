"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import type { CategoryRow } from "@/features/categories/queries";

export function NewProductButton({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New product
      </Button>
      <ProductFormDialog open={open} onOpenChange={setOpen} categories={categories} />
    </>
  );
}
