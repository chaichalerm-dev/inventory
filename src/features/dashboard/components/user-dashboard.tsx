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
import { StatCard } from "@/features/dashboard/components/stat-card";
import { RequisitionStatusBadge } from "@/features/requisitions/components/requisition-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateThai } from "@/lib/format";

const quickLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/products", label: "ค้นหาสินค้า", icon: Search },
  { href: "/requisitions/new", label: "เบิกสินค้า", icon: PackageMinus },
  { href: "/requisitions", label: "แจ้งคืนสินค้า", icon: Undo2 },
  { href: "/requisitions", label: "ประวัติของฉัน", icon: History },
];

export async function UserDashboard({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) {
  const data = await getUserDashboard(orgId, userId);

  return (
    <>
      <PageHeader title="ภาพรวมของฉัน" description="สรุปรายการเบิกสินค้าของคุณ" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="รายการเบิกทั้งหมด"
          value={data.total}
          suffix="รายการ"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="รอการอนุมัติ"
          value={data.pending}
          suffix="รายการ"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title="เบิกแล้ว"
          value={data.approved}
          suffix="รายการ"
          icon={PackageCheck}
          tone="green"
        />
        <StatCard
          title="คืนสินค้าแล้ว"
          value={data.returned}
          suffix="รายการ"
          icon={Undo2}
          tone="violet"
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">รายการเบิกล่าสุด</CardTitle>
            <Link
              href="/requisitions"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              ดูทั้งหมด
            </Link>
          </CardHeader>
          <CardContent>
            {data.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                ยังไม่มีรายการเบิก —{" "}
                <Link href="/requisitions/new" className="underline underline-offset-4">
                  เริ่มเบิกสินค้า
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
                      <span className="truncate">{req.summary}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDateThai(req.createdAt)}
                      </span>
                      <RequisitionStatusBadge status={req.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เมนูด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent"
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
