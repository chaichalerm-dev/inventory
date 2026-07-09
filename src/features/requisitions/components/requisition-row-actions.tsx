"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, PackageCheck, Undo2, X } from "lucide-react";
import type { RequisitionRow } from "@/features/requisitions/queries";
import {
  approveRequisitionAction,
  confirmReturnAction,
  rejectRequisitionAction,
  requestReturnAction,
} from "@/features/requisitions/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate } from "@/lib/i18n/get-dictionary";
import type { ActionResult } from "@/lib/action-result";

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "destructive" | "default";
  run: () => Promise<ActionResult>;
  successMessage: string;
};

type RequisitionRowActionsProps = {
  requisition: RequisitionRow;
  isAdmin: boolean;
};

export function RequisitionRowActions({
  requisition,
  isAdmin,
}: RequisitionRowActionsProps) {
  const { dict } = useLanguage();
  const t = dict.requisitions;
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  function execute(action: PendingAction) {
    startTransition(async () => {
      const result = await action.run();
      if (result.ok) {
        toast.success(action.successMessage);
      } else {
        toast.error(result.error);
      }
    });
  }

  const buttons: React.ReactNode[] = [];

  if (isAdmin && requisition.status === "PENDING") {
    buttons.push(
      <Button
        key="approve"
        size="sm"
        disabled={isPending}
        onClick={() =>
          setPendingAction({
            title: interpolate(t.approveConfirmTitle, { reqNumber: requisition.reqNumber }),
            description: t.approveConfirmDesc,
            confirmLabel: t.approve,
            run: () => approveRequisitionAction(requisition.id),
            successMessage: t.approveSuccess,
          })
        }
      >
        <Check className="size-4" />
        {t.approve}
      </Button>,
      <Button
        key="reject"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          setPendingAction({
            title: interpolate(t.rejectConfirmTitle, { reqNumber: requisition.reqNumber }),
            description: t.rejectConfirmDesc,
            confirmLabel: t.reject,
            variant: "destructive",
            run: () => rejectRequisitionAction(requisition.id),
            successMessage: t.rejectSuccess,
          })
        }
      >
        <X className="size-4" />
        {t.reject}
      </Button>,
    );
  }

  if (isAdmin && requisition.status === "RETURN_REQUESTED") {
    buttons.push(
      <Button
        key="confirm-return"
        size="sm"
        disabled={isPending}
        onClick={() =>
          setPendingAction({
            title: interpolate(t.confirmReturnTitle, { reqNumber: requisition.reqNumber }),
            description: t.confirmReturnDesc,
            confirmLabel: t.confirmReturn,
            run: () => confirmReturnAction(requisition.id),
            successMessage: t.confirmReturnSuccess,
          })
        }
      >
        <PackageCheck className="size-4" />
        {t.confirmReturn}
      </Button>,
    );
  }

  if (!isAdmin && requisition.status === "APPROVED") {
    buttons.push(
      <Button
        key="request-return"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          setPendingAction({
            title: interpolate(t.requestReturnTitle, { reqNumber: requisition.reqNumber }),
            description: t.requestReturnDesc,
            confirmLabel: t.requestReturn,
            run: () => requestReturnAction(requisition.id),
            successMessage: t.requestReturnSuccess,
          })
        }
      >
        <Undo2 className="size-4" />
        {t.requestReturn}
      </Button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <>
      <div className="flex justify-end gap-2">{buttons}</div>
      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
        confirmLabel={pendingAction?.confirmLabel}
        variant={pendingAction?.variant ?? "default"}
        onConfirm={() => {
          if (pendingAction) execute(pendingAction);
        }}
      />
    </>
  );
}
