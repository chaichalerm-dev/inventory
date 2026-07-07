"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New category
      </Button>
      <CategoryFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
