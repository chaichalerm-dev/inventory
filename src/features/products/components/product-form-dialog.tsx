"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CupSoda, Trash2, Upload } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
} from "@/features/products/actions";
import {
  NO_CATEGORY,
  productSchema,
  type ProductInput,
} from "@/features/products/schemas";
import type { ProductRow } from "@/features/products/queries";
import type { CategoryRow } from "@/features/categories/queries";
import { useLanguage } from "@/lib/i18n/language-provider";
import { resizeImageToDataUrl } from "@/lib/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRootError } from "@/components/shared/form-root-error";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRow[];
  /** When set, the dialog edits this product; otherwise it creates one. */
  product?: ProductRow;
};

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  product,
}: ProductFormDialogProps) {
  const { dict } = useLanguage();
  const t = dict.products;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? t.editProduct : t.newProduct}</DialogTitle>
          <DialogDescription>
            {product ? t.editProductDesc : t.newProductDesc}
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children on close, so this form
            remounts with fresh state every time the dialog opens. */}
        <ProductForm
          product={product}
          categories={categories}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

const MAX_IMAGE_DIMENSION = 512;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function ProductForm({
  product,
  categories,
  onDone,
}: {
  product?: ProductRow;
  categories: CategoryRow[];
  onDone: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.products;
  const isEdit = product !== undefined;
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const numberFields = [
    { name: "price", label: t.price, step: "0.01" },
    { name: "costPrice", label: t.costPrice, step: "0.01" },
    { name: "minStock", label: t.minStock, step: "1" },
  ] as const;

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      imageUrl: product?.imageUrl ?? null,
      categoryId: product?.categoryId ?? NO_CATEGORY,
      unit: product?.unit ?? "pcs",
      price: product?.price ?? 0,
      costPrice: product?.costPrice ?? 0,
      minStock: product?.minStock ?? 0,
    },
  });

  function onSubmit(values: ProductInput) {
    setRootError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateProductAction(product.id, values)
        : await createProductAction(values);

      if (!result.ok) {
        setRootError(result.error);
        if (result.fieldErrors?.sku?.[0]) {
          form.setError("sku", { message: result.fieldErrors.sku[0] });
        }
        return;
      }
      toast.success(isEdit ? t.productUpdated : t.productCreated);
      onDone();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.photo}</FormLabel>
              <FormControl>
                <ProductImageField value={field.value ?? null} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.sku}</FormLabel>
                <FormControl>
                  <Input placeholder={t.skuPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.unit}</FormLabel>
                <FormControl>
                  <Input placeholder={t.unitPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.name}</FormLabel>
              <FormControl>
                <Input placeholder={t.namePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.category}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>{t.noCategory}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {numberFields.map(({ name, label, step }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={step}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.description}</FormLabel>
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
          {isPending ? t.saving : isEdit ? t.saveChanges : t.createProduct}
        </Button>
      </form>
    </Form>
  );
}

// A picture is the fastest way to tell visually similar products apart
// (e.g. a can vs. a bottle of the same drink) — kept in form state like any
// other field rather than uploaded immediately, so it saves/cancels with
// the rest of the dialog.
function ProductImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.products;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.invalidImage);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t.imageTooLarge);
      return;
    }

    setIsProcessing(true);
    try {
      onChange(await resizeImageToDataUrl(file, MAX_IMAGE_DIMENSION));
    } catch {
      toast.error(t.processError);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {value ? (
          // Local data URL, not a remote src next/image can optimize.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <CupSoda className="size-8 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {value ? t.changePhoto : t.uploadPhoto}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            onClick={() => onChange(null)}
          >
            <Trash2 className="size-4" />
            {t.removePhoto}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
