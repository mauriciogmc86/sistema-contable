import { formatCurrency, type Currency } from "@/presentation/utils/format";
import { cn } from "@/presentation/utils/cn";

export interface CurrencyDisplayProps {
  value: number;
  currency?: Currency;
  /** When provided, renders a dual VES/USD stacked display. */
  secondary?: { value: number; currency: Currency };
  className?: string;
  colorBySign?: boolean;
}

export function CurrencyDisplay({
  value,
  currency = "VES",
  secondary,
  className,
  colorBySign,
}: CurrencyDisplayProps) {
  const signColor = colorBySign ? (value < 0 ? "text-danger" : "text-success") : undefined;
  return (
    <span className={cn("inline-flex flex-col tabular-nums", className)}>
      <span className={cn("font-medium", signColor)}>{formatCurrency(value, currency)}</span>
      {secondary && (
        <span className="text-xs text-muted-foreground">
          {formatCurrency(secondary.value, secondary.currency)}
        </span>
      )}
    </span>
  );
}
