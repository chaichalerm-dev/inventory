import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Purchase orders" };

export default function PurchaseOrdersPage() {
  return <ComingSoon title="Purchase orders" milestone="milestone 4" />;
}
