import {
  BarChart3,
  BookOpen,
  Building2,
  LayoutDashboard,
  ListTree,
  type LucideIcon,
  ReceiptText,
  Scale,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "General",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Empresas", href: "/dashboard/empresas", icon: Building2 },
    ],
  },
  {
    title: "Contabilidad",
    items: [
      { label: "Libro Diario", href: "/dashboard/libro-diario", icon: BookOpen },
      { label: "Libros Fiscales", href: "/dashboard/libros-fiscales", icon: ScrollText },
      { label: "Plan de Cuentas", href: "/dashboard/plan-cuentas", icon: ListTree },
      { label: "Facturación", href: "/dashboard/facturacion", icon: ReceiptText },
      { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    ],
  },
  {
    title: "Gestión",
    items: [
      { label: "Nómina", href: "/dashboard/laboral", icon: Users },
      { label: "Legal", href: "/dashboard/legal", icon: Scale },
      { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
    ],
  },
];
