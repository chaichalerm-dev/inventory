import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "ใบสั่งซื้อ" };

export default async function PurchaseOrdersPage() {
  await requireAdmin();
  const dict = getDictionary(await getLocale());
  return (
    <ComingSoon
      title={dict.comingSoon.purchaseOrdersTitle}
      milestone="milestone 4"
      dict={dict}
    />
  );
}
