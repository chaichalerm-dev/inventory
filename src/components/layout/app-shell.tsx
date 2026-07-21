"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { MembershipRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { BrandMark } from "@/components/brand/brand-mark";
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
    <div className="flex h-svh overflow-hidden bg-background">
      <aside
        className={
          "relative hidden shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex " +
          (collapsed ? "w-[4.5rem]" : "w-[17rem]")
        }
      >
        <div className="flex h-17 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
              <BrandMark logoUrl={logoUrl} className="size-9" />
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold tracking-[-0.02em] text-white">
                    {dict.common.appName}
                  </span>
                  <span className="block truncate text-[0.65rem] font-medium tracking-[0.12em] text-sidebar-foreground/70 uppercase">
                    {dict.common.tagline}
                  </span>
                </span>
              ) : null}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={collapsed ? "hidden" : "ml-auto text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"}
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
        <div className="mt-auto shrink-0 border-t border-sidebar-border p-3">
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"
              onClick={toggleCollapsed}
              aria-label={dict.nav.expandMenu}
            >
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <div className="flex items-center gap-3 border-l-2 border-sidebar-primary px-3 py-1.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-white">
                {name.trim().charAt(0).toUpperCase() || "U"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{name}</span>
                <span className="block text-xs text-sidebar-foreground/75">{roleLabel}</span>
              </span>
            </div>
          )}
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card/95 px-4 text-foreground backdrop-blur md:px-7">
          <MobileNav role={role} />
          <div className="hidden items-center gap-2 text-xs font-medium tracking-[0.04em] text-muted-foreground md:flex">
            <span className="size-1.5 bg-primary" aria-hidden="true" />
            {dict.common.tagline}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <UserMenu name={name} email={email} roleLabel={roleLabel} avatarUrl={avatarUrl} />
          </div>
        </header>
        <main className="app-canvas min-h-0 flex-1 overflow-y-auto p-4 md:p-7 xl:p-9">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
