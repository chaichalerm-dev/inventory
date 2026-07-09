"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";
import { useLanguage } from "@/lib/i18n/language-provider";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  const { dict } = useLanguage();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {dict.categories.newCategory}
      </Button>
      <CategoryFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
