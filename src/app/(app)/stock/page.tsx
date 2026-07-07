import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Stock movements" };

export default function StockPage() {
  return <ComingSoon title="Stock movements" milestone="milestone 2" />;
}
