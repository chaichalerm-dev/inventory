"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { getNavGroups, type NavItem } from "@/config/nav";
import { useLanguage } from "@/lib/i18n/language-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Receives the role (a plain string) instead of nav items because icon
// components cannot cross the server → client boundary as props.
export function SidebarNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: MembershipRole;
  /** Icon-only mode — labels and group headings collapse to tooltips. */
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { dict } = useLanguage();
  const groups = getNavGroups(role, dict);

  return (
    <nav aria-label={dict.nav.mainNavigation} className="flex flex-col gap-5 p-3 pt-5">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          {collapsed ? (
            <div className="mx-2 my-1 border-t border-sidebar-border" role="separator" />
          ) : (
            <p className="px-3 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] text-sidebar-foreground/65 uppercase">
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={
                item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

function NavLink({
  item: { href, label, icon: Icon },
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-10 items-center gap-3 rounded-[2px] px-3 py-2 text-sm font-medium transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-sidebar-primary before:opacity-0",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-sidebar-accent text-white before:opacity-100"
          : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-white",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && label}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
