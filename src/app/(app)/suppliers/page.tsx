import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Suppliers" };

export default function SuppliersPage() {
  return <ComingSoon title="Suppliers" milestone="milestone 4" />;
}
