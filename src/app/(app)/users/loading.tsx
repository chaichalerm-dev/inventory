import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function UsersLoading() {
  return (
    <div aria-busy="true">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <TableSkeleton />
    </div>
  );
}
