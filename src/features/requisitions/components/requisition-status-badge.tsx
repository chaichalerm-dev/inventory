import type { RequisitionStatus } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusClassName: Record<RequisitionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  RETURN_REQUESTED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  RETURNED: "bg-muted text-muted-foreground",
};

function statusLabel(status: RequisitionStatus, dict: Dictionary): string {
  const t = dict.requisitions;
  switch (status) {
    case "PENDING":
      return t.statusPending;
    case "APPROVED":
      return t.statusApproved;
    case "REJECTED":
      return t.statusRejected;
    case "RETURN_REQUESTED":
      return t.statusReturnRequested;
    case "RETURNED":
      return t.statusReturned;
  }
}

export function RequisitionStatusBadge({
  status,
  dict,
}: {
  status: RequisitionStatus;
  dict: Dictionary;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", statusClassName[status])}
    >
      {statusLabel(status, dict)}
    </Badge>
  );
}
