import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "ซัพพลายเออร์" };

export default async function SuppliersPage() {
  await requireAdmin();
  const dict = getDictionary(await getLocale());
  return (
    <ComingSoon title={dict.comingSoon.suppliersTitle} milestone="milestone 4" dict={dict} />
  );
}
