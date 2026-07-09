import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { getRequisitions } from "@/features/requisitions/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { RequisitionsTable } from "@/features/requisitions/components/requisitions-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "รายการเบิกสินค้า · Requisitions" };

export default async function RequisitionsPage() {
  const { orgId, userId, role } = await requireSession();
  const isAdmin = isAdminRole(role);
  const [requisitions, dict] = await Promise.all([
    getRequisitions(orgId, isAdmin ? undefined : userId),
    getLocale().then(getDictionary),
  ]);
  const t = dict.requisitions;

  const newButton = (
    <Button asChild>
      <Link href="/requisitions/new">
        <Plus className="size-4" />
        {t.requestButton}
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={isAdmin ? t.titleAdmin : t.titleUser}
        description={isAdmin ? t.descAdmin : t.descUser}
      >
        {isAdmin ? null : newButton}
      </PageHeader>
      {requisitions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t.noRequisitionsTitle}
          description={isAdmin ? t.noRequisitionsYetAdmin : t.noRequisitionsYetUser}
        >
          {isAdmin ? null : newButton}
        </EmptyState>
      ) : (
        <RequisitionsTable requisitions={requisitions} isAdmin={isAdmin} />
      )}
    </>
  );
}
