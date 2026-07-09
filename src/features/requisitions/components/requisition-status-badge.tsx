import type { RequisitionStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<RequisitionStatus, { label: string; className: string }> = {
  PENDING: {
    label: "รออนุมัติ",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REJECTED: {
    label: "ไม่อนุมัติ",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  RETURN_REQUESTED: {
    label: "รอรับคืน",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  RETURNED: {
    label: "คืนแล้ว",
    className: "bg-muted text-muted-foreground",
  },
};

export function RequisitionStatusBadge({ status }: { status: RequisitionStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn("border-transparent", config.className)}>
      {config.label}
    </Badge>
  );
}
