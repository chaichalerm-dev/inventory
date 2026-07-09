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

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the pathname exactly instead of by prefix (for parent routes). */
  exact?: boolean;
};

export type NavGroup = {
  /** Section heading, e.g. "คลังสินค้า" — hidden when the sidebar is collapsed. */
  label: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "ภาพรวม",
    items: [{ href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard }],
  },
  {
    label: "คลังสินค้า",
    items: [
      { href: "/products", label: "จัดการสินค้า", icon: Package },
      { href: "/categories", label: "หมวดหมู่สินค้า", icon: Tags },
      { href: "/stock", label: "รับเข้า / เคลื่อนไหว", icon: ArrowLeftRight },
    ],
  },
  {
    label: "การเบิก-คืน",
    items: [
      { href: "/requisitions", label: "รายการเบิกสินค้า", icon: ClipboardList },
    ],
  },
  {
    label: "ระบบ",
    items: [
      { href: "/users", label: "จัดการผู้ใช้งาน", icon: Users },
      { href: "/reports", label: "รายงาน", icon: BarChart3 },
      { href: "/settings", label: "ตั้งค่าระบบ", icon: Settings },
    ],
  },
];

export const userNavGroups: NavGroup[] = [
  {
    label: "ภาพรวม",
    items: [{ href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard }],
  },
  {
    label: "สินค้า",
    items: [{ href: "/products", label: "รายการสินค้า", icon: Package }],
  },
  {
    label: "เบิก-คืนสินค้า",
    items: [
      { href: "/requisitions/new", label: "เบิกสินค้า", icon: PackageMinus },
      {
        href: "/requisitions",
        label: "รายการเบิกของฉัน",
        icon: History,
        exact: true,
      },
    ],
  },
];

export function navGroupsForRole(role: MembershipRole): NavGroup[] {
  return isAdminRole(role) ? adminNavGroups : userNavGroups;
}
