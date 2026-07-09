"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/categories/actions";
import { categorySchema, type CategoryInput } from "@/features/categories/schemas";
import type { CategoryRow } from "@/features/categories/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this category; otherwise it creates one. */
  category?: CategoryRow;
};

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category details." : "Group related products together."}
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children on close, so this form
            remounts with fresh state every time the dialog opens. */}
        <CategoryForm category={category} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category?: CategoryRow;
  onDone: () => void;
}) {
  const isEdit = category !== undefined;
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  function onSubmit(values: CategoryInput) {
    setRootError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateCategoryAction(category.id, values)
        : await createCategoryAction(values);

      if (!result.ok) {
        setRootError(result.error);
        if (result.fieldErrors?.name?.[0]) {
          form.setError("name", { message: result.fieldErrors.name[0] });
        }
        return;
      }
      toast.success(isEdit ? "Category updated" : "Category created");
      onDone();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError message={rootError} />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || (isEdit && !form.formState.isDirty)}
        >
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create category"}
        </Button>
      </form>
    </Form>
  );
}
