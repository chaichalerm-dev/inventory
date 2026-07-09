import { Construction } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/get-dictionary";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export function ComingSoon({
  title,
  milestone,
  dict,
}: {
  title: string;
  milestone: string;
  dict: Dictionary;
}) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title={dict.comingSoon.title}
        description={interpolate(dict.comingSoon.description, { feature: title, milestone })}
      />
    </>
  );
}
