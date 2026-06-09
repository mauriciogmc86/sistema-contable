/**
 * Locale-aware formatting helpers (Venezuela, es-VE).
 * Supports dual currency (VES / USD) common in Venezuelan accounting.
 */

const LOCALE = "es-VE";

export type Currency = "VES" | "USD";

export function formatCurrency(value: number, currency: Currency = "VES"): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

/** "Bs. 1.234,56 / $ 1.234,56" style dual display. */
export function formatDualCurrency(ves: number, usd: number): string {
  return `${formatCurrency(ves, "VES")} · ${formatCurrency(usd, "USD")}`;
}

export function formatNumber(value: number, fractionDigits = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safe);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "2-digit" });
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE, { year: "numeric", month: "long" });
}

/** Normalize a Venezuelan RIF to canonical "X-00000000-0" format. */
export function formatRif(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^VEJPGRC0-9]/g, "");
  if (clean.length < 2) return clean;
  const letter = clean[0];
  const digits = clean.slice(1);
  const body = digits.slice(0, 8);
  const check = digits.slice(8, 9);
  return check ? `${letter}-${body}-${check}` : `${letter}-${body}`;
}

/** Normalize a Venezuelan cédula to "V-00000000" format. */
export function formatCedula(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^VE0-9]/g, "");
  if (clean.length < 2) return clean;
  return `${clean[0]}-${clean.slice(1, 9)}`;
}
