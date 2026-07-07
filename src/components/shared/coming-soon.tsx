import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export function ComingSoon({ title, milestone }: { title: string; milestone: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title="Coming soon"
        description={`${title} ships in ${milestone}. The data model is already in place.`}
      />
    </>
  );
}
