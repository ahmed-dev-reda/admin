import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Star,
  BadgePercent,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/reviews",
    icon: Star,
  },
  {
    title: "Discounts",
    href: "/discounts",
    icon: BadgePercent,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
