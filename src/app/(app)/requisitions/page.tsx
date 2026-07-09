import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { getRequisitions } from "@/features/requisitions/queries";
import { RequisitionsTable } from "@/features/requisitions/components/requisitions-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "รายการเบิกสินค้า" };

export default async function RequisitionsPage() {
  const { orgId, userId, role } = await requireSession();
  const isAdmin = isAdminRole(role);
  const requisitions = await getRequisitions(orgId, isAdmin ? undefined : userId);

  const newButton = (
    <Button asChild>
      <Link href="/requisitions/new">
        <Plus className="size-4" />
        เบิกสินค้า
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={isAdmin ? "รายการเบิกสินค้า" : "รายการเบิกของฉัน"}
        description={
          isAdmin
            ? "อนุมัติคำขอเบิกและยืนยันการรับคืนสินค้า"
            : "ติดตามสถานะคำขอเบิกและแจ้งคืนสินค้า"
        }
      >
        {isAdmin ? null : newButton}
      </PageHeader>
      {requisitions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="ยังไม่มีรายการเบิก"
          description={
            isAdmin
              ? "เมื่อพนักงานส่งคำขอเบิกสินค้า รายการจะแสดงที่นี่"
              : "เริ่มเบิกสินค้าได้จากปุ่มด้านล่าง"
          }
        >
          {isAdmin ? null : newButton}
        </EmptyState>
      ) : (
        <RequisitionsTable requisitions={requisitions} isAdmin={isAdmin} />
      )}
    </>
  );
}
