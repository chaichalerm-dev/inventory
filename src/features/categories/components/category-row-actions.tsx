"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { CategoryRow } from "@/features/categories/queries";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CategoryRowActionsProps = {
  category: CategoryRow;
  onDelete: (id: string) => void;
};

export function CategoryRowActions({ category, onDelete }: CategoryRowActionsProps) {
  const { dict } = useLanguage();
  const t = dict.categories;
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={interpolate(dict.common.actionsFor, { name: category.name })}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            {dict.common.edit}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            {dict.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryFormDialog open={editOpen} onOpenChange={setEditOpen} category={category} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={interpolate(t.deleteConfirmTitle, { name: category.name })}
        description={
          category.productCount > 0
            ? interpolate(t.deleteDescWithProducts, { count: category.productCount })
            : t.deleteDescNoProducts
        }
        onConfirm={() => onDelete(category.id)}
      />
    </>
  );
}
