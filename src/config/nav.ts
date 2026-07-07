import {
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/stock", label: "Stock movements", icon: ArrowLeftRight },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/purchase-orders", label: "Purchase orders", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];
