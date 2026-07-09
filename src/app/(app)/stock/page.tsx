import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "รับเข้า / เคลื่อนไหวสินค้า" };

export default async function StockPage() {
  await requireAdmin();
  const dict = getDictionary(await getLocale());
  return (
    <ComingSoon title={dict.comingSoon.stockTitle} milestone="milestone 2" dict={dict} />
  );
}
