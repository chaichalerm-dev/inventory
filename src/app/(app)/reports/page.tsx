import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "รายงาน" };

export default async function ReportsPage() {
  await requireAdmin();
  return <ComingSoon title="รายงาน" milestone="milestone 3" />;
}
