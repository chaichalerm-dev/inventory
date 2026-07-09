import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getProducts } from "@/features/products/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  RequisitionForm,
  type RequisitionProductOption,
} from "@/features/requisitions/components/requisition-form";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "เบิกสินค้า · Request Stock" };

export default async function NewRequisitionPage() {
  const { orgId } = await requireSession();
  const [products, dict] = await Promise.all([
    getProducts(orgId),
    getLocale().then(getDictionary),
  ]);
  const t = dict.requisitions;

  const options: RequisitionProductOption[] = products
    .filter((p) => p.quantity > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      unit: p.unit,
    }));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.newTitle} description={t.newDesc} />
      {options.length === 0 ? (
        <EmptyState icon={PackageOpen} title={t.noProductsTitle} description={t.noProductsDesc} />
      ) : (
        <RequisitionForm products={options} />
      )}
    </div>
  );
}
