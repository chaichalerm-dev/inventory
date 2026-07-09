import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "รายงาน" };

export default async function ReportsPage() {
  await requireAdmin();
  const dict = getDictionary(await getLocale());
  return (
    <ComingSoon title={dict.comingSoon.reportsTitle} milestone="milestone 3" dict={dict} />
  );
}
