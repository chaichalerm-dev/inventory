import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "รับเข้า / เคลื่อนไหวสินค้า" };

export default async function StockPage() {
  await requireAdmin();
  return <ComingSoon title="รับเข้า / เคลื่อนไหวสินค้า" milestone="milestone 2" />;
}
