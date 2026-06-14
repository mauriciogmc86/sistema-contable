const LOCALE = "es-VE";

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatLongDate(date: Date | string): string {
  const d = typeof date === "string" ? parseIsoDate(date) : date;
  return d.toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseIsoDate(date) : date;
  return d.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? parseIsoDate(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetweenInclusive(start: string, end: string): number {
  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  return Math.max(0, Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1);
}

export function countSundaysInRange(start: string, end: string): number {
  let count = 0;
  const current = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  while (current <= endDate) {
    if (current.getDay() === 0) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Años completos de servicio ininterrumpido al momento de la referencia. */
export function completedServiceYears(fechaIngreso: string, referenceDate = new Date()): number {
  const ingreso = parseIsoDate(fechaIngreso);
  let years = referenceDate.getFullYear() - ingreso.getFullYear();
  const anniversary = new Date(referenceDate.getFullYear(), ingreso.getMonth(), ingreso.getDate());
  if (referenceDate < anniversary) years -= 1;
  return Math.max(0, years);
}

export function hasCompletedFirstYear(fechaIngreso: string, referenceDate = new Date()): boolean {
  return completedServiceYears(fechaIngreso, referenceDate) >= 1;
}

export function getVacationPeriodLabel(fechaIngreso: string, yearsCompleted: number): string {
  const ingreso = parseIsoDate(fechaIngreso);
  const startYear = ingreso.getFullYear() + yearsCompleted;
  return `${startYear}-${startYear + 1}`;
}

/**
 * LOTTT Art. 190 — días de vacaciones anuales.
 * 15 días el primer año; +1 día por cada año adicional hasta 30.
 */
export function vacationDaysArt190(fechaIngreso: string, referenceDate = new Date()): number {
  const years = completedServiceYears(fechaIngreso, referenceDate);
  if (years < 1) return 0;
  return Math.min(30, 14 + years);
}

/** LOTTT Art. 192 — bono vacacional: misma escala que Art. 190. */
export function vacationBonusDaysArt192(fechaIngreso: string, referenceDate = new Date()): number {
  return vacationDaysArt190(fechaIngreso, referenceDate);
}

/** Inicio de vacaciones: primer lunes en o después del aniversario del periodo vigente. */
export function getVacationStartDate(fechaIngreso: string, referenceDate = new Date()): Date {
  const years = completedServiceYears(fechaIngreso, referenceDate);
  const ingreso = parseIsoDate(fechaIngreso);
  const anniversary = new Date(ingreso);
  anniversary.setFullYear(ingreso.getFullYear() + Math.max(1, years));
  const d = new Date(anniversary);
  if (d.getDay() === 1) return d;
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

/** Feriados nacionales fijos (mes/día). Semana Santa se aproxima por año cuando aplica. */
function isVenezuelanHoliday(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const fixed = [
    [1, 1],
    [4, 19],
    [5, 1],
    [6, 24],
    [7, 5],
    [7, 24],
    [10, 12],
    [12, 24],
    [12, 25],
    [12, 31],
  ];
  return fixed.some(([fm, fd]) => fm === m && fd === d);
}

export function countHolidaysInRange(start: string, end: string): number {
  let count = 0;
  const current = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  while (current <= endDate) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6 && isVenezuelanHoliday(current)) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Fin del periodo vacacional en calendario:
 * días de vacaciones + domingos + feriados dentro del rango.
 */
export function getVacationEndDate(
  fechaIngreso: string,
  vacationDays: number,
  referenceDate = new Date(),
): string {
  const start = getVacationStartDate(fechaIngreso, referenceDate);
  const startIso = toIsoDate(start);
  let end = addDays(start, vacationDays - 1);

  for (let i = 0; i < 6; i += 1) {
    const endIso = toIsoDate(end);
    const sundays = countSundaysInRange(startIso, endIso);
    const feriados = countHolidaysInRange(startIso, endIso);
    const span = vacationDays + sundays + feriados;
    const nextEnd = addDays(start, span - 1);
    if (toIsoDate(nextEnd) === endIso) break;
    end = nextEnd;
  }
  return toIsoDate(end);
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i += 1) days.push(null);
  for (let d = 1; d <= last.getDate(); d += 1) days.push(new Date(year, month, d));
  return days;
}

/** Meses (año/mes) que cubre un rango de fechas inclusive. */
export function getMonthsInRange(start: string, end: string): { year: number; month: number }[] {
  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  const months: { year: number; month: number }[] = [];
  let current = new Date(s.getFullYear(), s.getMonth(), 1);
  const last = new Date(e.getFullYear(), e.getMonth(), 1);

  while (current <= last) {
    months.push({ year: current.getFullYear(), month: current.getMonth() });
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  return months;
}

export function isDateInRange(date: Date, start: string, end: string): boolean {
  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  return date >= s && date <= e;
}
