"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createRequisitionAction } from "@/features/requisitions/actions";
import {
  requisitionSchema,
  type RequisitionInput,
} from "@/features/requisitions/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";

export type RequisitionProductOption = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
};

type RequisitionFormProps = {
  products: RequisitionProductOption[];
};

export function RequisitionForm({ products }: RequisitionFormProps) {
  const { dict } = useLanguage();
  const t = dict.requisitions;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<RequisitionInput>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: { note: "", items: [{ productId: "", quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  // One subscription for the whole array — form.watch() inside the map
  // below would both violate the rules of hooks and disable the React
  // Compiler for this component.
  const watchedItems = useWatch({ control: form.control, name: "items" });

  function onSubmit(values: RequisitionInput) {
    setRootError(null);
    startTransition(async () => {
      const result = await createRequisitionAction(values);
      if (result.ok) {
        toast.success(t.submitSuccess);
        router.push("/requisitions");
        router.refresh();
      } else {
        setRootError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-3">
              {fields.map((fieldItem, index) => {
                const selectedId = watchedItems?.[index]?.productId;
                const selected = selectedId ? productById.get(selectedId) : undefined;
                return (
                  <div
                    key={fieldItem.id}
                    className="flex flex-wrap items-start gap-2 sm:flex-nowrap"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="min-w-0 flex-1 basis-64">
                          {index === 0 ? <FormLabel>{t.product}</FormLabel> : null}
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.selectProduct} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} — {t.remaining} {product.quantity}{" "}
                                  {product.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selected ? (
                            <p className="text-xs text-muted-foreground">
                              SKU: {selected.sku}
                            </p>
                          ) : null}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          {index === 0 ? <FormLabel>{t.quantity}</FormLabel> : null}
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              value={Number.isNaN(field.value) ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className={index === 0 ? "pt-[22px]" : ""}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t.removeItem}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1 })}
            >
              <Plus className="size-4" />
              {t.addProduct}
            </Button>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.note}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder={t.notePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormRootError message={rootError} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                {dict.common.cancel}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t.submitting : t.submit}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
