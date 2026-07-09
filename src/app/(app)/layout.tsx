import Link from "next/link";
import { Boxes } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { roleLabels } from "@/lib/roles";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.orgId) redirect("/sign-in");
  const role = session.user.role;

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="size-4" aria-hidden="true" />
          </span>
          <Link href="/dashboard" className="font-semibold">
            StockPro
          </Link>
        </div>
        <SidebarNav role={role} />
        <div className="mt-auto border-t px-4 py-3">
          <p className="truncate text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <MobileNav role={role} />
          <div className="ml-auto">
            <UserMenu
              name={session.user.name ?? "User"}
              email={session.user.email ?? ""}
              roleLabel={roleLabels[role]}
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
