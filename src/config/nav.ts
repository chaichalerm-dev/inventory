import {
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  PackageMinus,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { MembershipRole } from "@/generated/prisma/enums";
import { isAdminRole } from "@/lib/roles";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the pathname exactly instead of by prefix (for parent routes). */
  exact?: boolean;
};

export type NavGroup = {
  /** Section heading — hidden when the sidebar is collapsed. */
  label: string;
  items: NavItem[];
};

export function getNavGroups(role: MembershipRole, dict: Dictionary): NavGroup[] {
  const { nav } = dict;

  if (isAdminRole(role)) {
    return [
      {
        label: nav.groupOverview,
        items: [{ href: "/dashboard", label: nav.dashboard, icon: LayoutDashboard }],
      },
      {
        label: nav.groupInventory,
        items: [
          { href: "/products", label: nav.products, icon: Package },
          { href: "/categories", label: nav.categories, icon: Tags },
          { href: "/stock", label: nav.stock, icon: ArrowLeftRight },
        ],
      },
      {
        label: nav.groupRequisitions,
        items: [{ href: "/requisitions", label: nav.requisitions, icon: ClipboardList }],
      },
      {
        label: nav.groupSystem,
        items: [
          { href: "/users", label: nav.users, icon: Users },
          { href: "/reports", label: nav.reports, icon: BarChart3 },
          { href: "/settings", label: nav.settings, icon: Settings },
        ],
      },
    ];
  }

  return [
    {
      label: nav.groupOverview,
      items: [{ href: "/dashboard", label: nav.dashboard, icon: LayoutDashboard }],
    },
    {
      label: nav.groupProducts,
      items: [{ href: "/products", label: nav.myProducts, icon: Package }],
    },
    {
      label: nav.groupRequisitions,
      items: [
        { href: "/requisitions/new", label: nav.requisitionNew, icon: PackageMinus },
        { href: "/requisitions", label: nav.myRequisitions, icon: History, exact: true },
      ],
    },
  ];
}
