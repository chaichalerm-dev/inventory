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
    <nav aria-label={dict.nav.mainNavigation} className="flex flex-col gap-4 p-2">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          {collapsed ? (
            <div className="mx-2 my-1 border-t" role="separator" />
          ) : (
            <p className="px-3 text-xs font-medium text-muted-foreground/80">
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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
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
