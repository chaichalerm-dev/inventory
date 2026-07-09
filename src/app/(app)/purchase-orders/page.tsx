import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "ใบสั่งซื้อ" };

export default async function PurchaseOrdersPage() {
  await requireAdmin();
  return <ComingSoon title="ใบสั่งซื้อ" milestone="milestone 4" />;
}
