"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/presentation/utils/cn";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";

export function CompanyPicker() {
  const companies = useCompanyStore((s) => s.companies);
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useCompanyStore((s) => s.setActiveCompanyId);
  const loading = useCompanyStore((s) => s.loading);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = companies.find((c) => c.id === activeCompanyId);

  const filtered = search
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.rif?.toLowerCase().includes(search.toLowerCase()),
      )
    : companies;

  const toggle = () => {
    if (companies.length === 0) return;
    setOpen((o) => !o);
    setSearch("");
  };

  const select = (id: string) => {
    setActiveCompanyId(id);
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
        className={cn(
          "flex h-9 w-[13rem] items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 text-sm",
          "transition-all duration-200 hover:border-primary/30 hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "border-primary/40 bg-muted",
          (loading || companies.length === 0) && "cursor-not-allowed opacity-60",
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-left font-medium">
          {loading ? "Cargando…" : (active?.name ?? (companies.length === 0 ? "Sin empresas" : "Seleccionar"))}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar empresa activa"
          className="absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-premium"
        >
          {/* Search */}
          <div className="border-b border-border px-3 py-2.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empresa o RIF…"
                className={cn(
                  "h-8 w-full rounded-md bg-input pl-8 pr-3 text-sm text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none",
                )}
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-5 text-center text-xs text-muted-foreground">Sin resultados</p>
            ) : (
              filtered.map((c) => {
                const isActive = c.id === activeCompanyId;
                const initials = c.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("");
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => select(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted",
                      isActive && "bg-primary/8 text-primary",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {initials || "?"}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-medium leading-tight">{c.name}</p>
                      {c.rif && (
                        <p className="truncate font-mono text-[11px] leading-tight text-muted-foreground">
                          {c.rif}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              {companies.length} empresa{companies.length !== 1 ? "s" : ""} registrada
              {companies.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
