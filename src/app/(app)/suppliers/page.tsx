import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "ซัพพลายเออร์" };

export default async function SuppliersPage() {
  await requireAdmin();
  return <ComingSoon title="ซัพพลายเออร์" milestone="milestone 4" />;
}
