"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import type { CategoryRow } from "@/features/categories/queries";
import { useLanguage } from "@/lib/i18n/language-provider";

export function NewProductButton({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const { dict } = useLanguage();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {dict.products.newProduct}
      </Button>
      <ProductFormDialog open={open} onOpenChange={setOpen} categories={categories} />
    </>
  );
}
