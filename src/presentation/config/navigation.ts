import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  FileSpreadsheet,
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
      { label: "Reporte Personal", href: "/dashboard/reportes-personal", icon: FileSpreadsheet },
      { label: "Legal", href: "/dashboard/legal", icon: Scale },
      { label: "Cargos", href: "/dashboard/cargos", icon: Briefcase },
      { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
    ],
  },
];
