"use client";

import { useCurrencyStore } from "@/presentation/store/useCurrencyStore";
import { cn } from "@/presentation/utils/cn";

export function CurrencyToggle() {
  const currency = useCurrencyStore((s) => s.currency);
  const toggleCurrency = useCurrencyStore((s) => s.toggleCurrency);

  return (
    <div
      role="radiogroup"
      aria-label="Moneda activa"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {(["VES", "USD"] as const).map((c) => {
        const active = currency === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c === "VES" ? "Bolívares" : "Dólares"}
            title={c === "VES" ? "Bolívares (Bs.)" : "Dólares (USD)"}
            onClick={() => !active && toggleCurrency()}
            className={cn(
              "flex h-7 min-w-[2.25rem] items-center justify-center rounded-md px-2 text-[11px] font-bold tracking-wide transition-colors duration-200 cursor-pointer",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "VES" ? "Bs$" : "$"}
          </button>
        );
      })}
    </div>
  );
}
