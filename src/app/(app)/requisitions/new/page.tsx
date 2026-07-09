import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getProducts } from "@/features/products/queries";
import {
  RequisitionForm,
  type RequisitionProductOption,
} from "@/features/requisitions/components/requisition-form";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "เบิกสินค้า" };

export default async function NewRequisitionPage() {
  const { orgId } = await requireSession();
  const products = await getProducts(orgId);

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
      <PageHeader
        title="เบิกสินค้า"
        description="เลือกสินค้าและจำนวนที่ต้องการ ระบบจะส่งคำขอให้ผู้ดูแลอนุมัติ"
      />
      {options.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="ไม่มีสินค้าที่เบิกได้"
          description="ขณะนี้ไม่มีสินค้าที่มีสต็อกคงเหลือ กรุณาติดต่อผู้ดูแลระบบ"
        />
      ) : (
        <RequisitionForm products={options} />
      )}
    </div>
  );
}
