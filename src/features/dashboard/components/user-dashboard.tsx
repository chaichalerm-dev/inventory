import Link from "next/link";
import {
  ClipboardList,
  Clock,
  History,
  PackageCheck,
  PackageMinus,
  Search,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { getUserDashboard } from "@/features/dashboard/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/types";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { RequisitionStatusBadge } from "@/features/requisitions/components/requisition-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { interpolate } from "@/lib/i18n/get-dictionary";

export async function UserDashboard({
  orgId,
  userId,
  dict,
  locale,
}: {
  orgId: string;
  userId: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const data = await getUserDashboard(orgId, userId);
  const t = dict.dashboard.user;

  const quickLinks: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/products", label: t.searchProducts, icon: Search },
    { href: "/requisitions/new", label: t.requestItem, icon: PackageMinus },
    { href: "/requisitions", label: t.reportReturn, icon: Undo2 },
    { href: "/requisitions", label: t.myHistory, icon: History },
  ];

  return (
    <>
      <PageHeader title={t.title} description={t.description} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t.totalRequisitions}
          value={data.total}
          suffix={t.items}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title={t.pending}
          value={data.pending}
          suffix={t.items}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title={t.approved}
          value={data.approved}
          suffix={t.items}
          icon={PackageCheck}
          tone="green"
        />
        <StatCard
          title={t.returned}
          value={data.returned}
          suffix={t.items}
          icon={Undo2}
          tone="violet"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t.recentTitle}</CardTitle>
            <Link
              href="/requisitions"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {t.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {data.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t.noRequisitionsYet}{" "}
                <Link href="/requisitions/new" className="underline underline-offset-4">
                  {t.startRequesting}
                </Link>
              </p>
            ) : (
              <ul className="divide-y">
                {data.recent.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.reqNumber}
                      </span>
                      <span className="truncate">
                        {req.firstItemLabel}
                        {req.extraItemCount > 0
                          ? ` ${interpolate(dict.requisitions.itemsMore, { count: req.extraItemCount })}`
                          : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(req.createdAt, locale)}
                      </span>
                      <RequisitionStatusBadge status={req.status} dict={dict} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.quickMenu}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(({ href, label, icon: Icon }, index) => (
                <Link
                  key={label}
                  href={href}
                className="group flex min-h-28 flex-col items-start justify-between gap-3 rounded-[2px] border bg-background/45 p-4 text-sm font-medium transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-accent/55"
              >
                  <span className="text-[0.65rem] font-mono text-muted-foreground">0{index + 1}</span>
                  <span className="flex w-full items-end justify-between gap-2">
                    {label}
                    <Icon className="size-5 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
