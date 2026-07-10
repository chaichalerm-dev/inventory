"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { MembershipRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/lib/i18n/language-provider";

const SIDEBAR_COLLAPSED_KEY = "stockpro.sidebar-collapsed";

type AppShellProps = {
  role: MembershipRole;
  roleLabel: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  logoUrl: string | null;
  children: React.ReactNode;
};

export function AppShell({
  role,
  roleLabel,
  name,
  email,
  avatarUrl,
  logoUrl,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { dict } = useLanguage();

  useEffect(() => {
    // One-time hydration from localStorage (a browser-only API unavailable
    // during SSR) — the same pattern used for "remember email" on sign-in.
    const saved = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex h-svh overflow-hidden">
      <aside
        className={
          "hidden shrink-0 flex-col overflow-y-auto border-r bg-sidebar transition-[width] duration-200 md:flex " +
          (collapsed ? "w-16" : "w-60")
        }
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          {!collapsed ? (
            <>
              <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="size-full object-cover" />
                ) : (
                  <Boxes className="size-4" aria-hidden="true" />
                )}
              </span>
              <Link href="/dashboard" className="truncate font-semibold">
                {dict.common.appName}
              </Link>
            </>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className={collapsed ? "mx-auto" : "ml-auto"}
            onClick={toggleCollapsed}
            aria-label={collapsed ? dict.nav.expandMenu : dict.nav.collapseMenu}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        <SidebarNav role={role} collapsed={collapsed} />
        {!collapsed ? (
          <div className="mt-auto shrink-0 border-t px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        ) : null}
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <MobileNav role={role} />
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <UserMenu name={name} email={email} roleLabel={roleLabel} avatarUrl={avatarUrl} />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
