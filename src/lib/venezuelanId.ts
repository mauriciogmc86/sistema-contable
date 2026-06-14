/** Utilidades para cédula (V-) y RIF (J-) venezolanos. */

export function stripCedulaPrefix(value?: string | null): string {
  if (!value) return "";
  return value.replace(/^V-?/i, "").replace(/\D/g, "");
}

export function formatCedula(digits: string): string {
  const d = digits.replace(/\D/g, "");
  return `V-${d}`;
}

export function cedulaToInputValue(value?: string | null): string {
  return stripCedulaPrefix(value);
}

export function stripRifPrefix(value?: string | null): string {
  if (!value) return "";
  return value.replace(/^[VEJPGRC]-?/i, "").replace(/-/g, "");
}

export function parseRifInput(value?: string | null): { body: string; check: string } {
  const digits = stripRifPrefix(value);
  return {
    body: digits.slice(0, 8),
    check: digits.slice(8, 9),
  };
}

export function formatRif(body: string, check: string): string {
  return `J-${body}-${check}`;
}

export function rifToInputValue(value?: string | null): string {
  return stripRifPrefix(value);
}

export function normalizeCedula(value: string): string {
  const digits = stripCedulaPrefix(value);
  if (!digits) return value.trim().toUpperCase();
  return formatCedula(digits);
}

export function normalizeRif(value: string): string {
  const { body, check } = parseRifInput(value);
  if (body.length !== 8 || check.length !== 1) return value.trim().toUpperCase();
  return formatRif(body, check);
}
