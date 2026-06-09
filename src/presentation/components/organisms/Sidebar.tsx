"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_SECTIONS } from "@/presentation/config/navigation";
import { cn } from "@/presentation/utils/cn";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navegación principal"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30">
              CP
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Contable<span className="text-gradient">Pro</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-gradient-to-r from-primary/12 to-accent/5 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                            active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                          )}
                          aria-hidden
                        />
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <div className="bg-aurora relative overflow-hidden rounded-xl p-4 text-white">
            <div className="bg-dots absolute inset-0 text-white/60" aria-hidden />
            <div className="relative">
              <p className="text-sm font-semibold">Soporte premium</p>
              <p className="mt-1 text-xs text-white/70">Asesoría contable y respuesta prioritaria 24/7.</p>
              <button
                type="button"
                className="mt-3 w-full cursor-pointer rounded-lg bg-white/15 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                Contactar soporte
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
