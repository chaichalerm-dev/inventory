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
            title: `อนุมัติ ${requisition.reqNumber}?`,
            description: "ระบบจะตัดสต็อกสินค้าตามจำนวนที่เบิกทันที",
            confirmLabel: "อนุมัติ",
            run: () => approveRequisitionAction(requisition.id),
            successMessage: "อนุมัติรายการเบิกแล้ว",
          })
        }
      >
        <Check className="size-4" />
        อนุมัติ
      </Button>,
      <Button
        key="reject"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          setPendingAction({
            title: `ไม่อนุมัติ ${requisition.reqNumber}?`,
            description: "รายการเบิกนี้จะถูกปฏิเสธและไม่มีการตัดสต็อก",
            confirmLabel: "ไม่อนุมัติ",
            variant: "destructive",
            run: () => rejectRequisitionAction(requisition.id),
            successMessage: "ปฏิเสธรายการเบิกแล้ว",
          })
        }
      >
        <X className="size-4" />
        ไม่อนุมัติ
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
            title: `รับคืนสินค้า ${requisition.reqNumber}?`,
            description: "ระบบจะเพิ่มสต็อกสินค้ากลับตามจำนวนที่เบิกไป",
            confirmLabel: "รับคืน",
            run: () => confirmReturnAction(requisition.id),
            successMessage: "รับคืนสินค้าเรียบร้อย",
          })
        }
      >
        <PackageCheck className="size-4" />
        รับคืน
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
            title: `แจ้งคืนสินค้า ${requisition.reqNumber}?`,
            description: "ผู้ดูแลระบบจะตรวจสอบและยืนยันการรับคืนอีกครั้ง",
            confirmLabel: "แจ้งคืน",
            run: () => requestReturnAction(requisition.id),
            successMessage: "แจ้งคืนสินค้าแล้ว รอผู้ดูแลระบบยืนยัน",
          })
        }
      >
        <Undo2 className="size-4" />
        แจ้งคืน
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
