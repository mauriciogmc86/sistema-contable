import type { ClausulaRecord } from "@/infrastructure/repositories/SupabaseCargoRepository";

const UNKNOWN_ORDINAL = 1000;
const FINAL_ORDINAL = 9999;

const UNIT_VALUES: Readonly<Record<string, number>> = {
  primera: 1,
  primer: 1,
  segunda: 2,
  segundo: 2,
  tercera: 3,
  tercero: 3,
  cuarta: 4,
  cuarto: 4,
  quinta: 5,
  quinto: 5,
  sexta: 6,
  sexto: 6,
  septima: 7,
  setima: 7,
  septimo: 7,
  setimo: 7,
  octava: 8,
  octavo: 8,
  novena: 9,
  noveno: 9,
};

const COMPOUND_UNIT_PATTERN =
  "primera?|primer|segunda?|segundo|tercera?|tercero|cuarta?|cuarto|quinta?|quinto|sexta?|sexto|septima?|setima?|septimo?|setimo?|octava?|octavo|novena?|noveno";

function normalizeClauseTitle(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function unitValue(word: string): number | null {
  return UNIT_VALUES[word] ?? null;
}

/** Extrae el número ordinal legal de una cláusula desde su título. */
export function extractClauseOrdinal(titulo: string): number {
  const norm = normalizeClauseTitle(titulo);
  if (!norm) return UNKNOWN_ORDINAL;

  if (/\bclausula\s+final\b/.test(norm)) return FINAL_ORDINAL;

  const numericMatch =
    norm.match(/\bclausula\s+n[°º.]?\s*(\d+)\b/) ??
    norm.match(/\bclausula\s+(\d{1,2})\b/);
  if (numericMatch?.[1]) {
    const parsed = Number.parseInt(numericMatch[1], 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  // DÉCIMA/DÉCIMO + unidad (11–19). Debe evaluarse ANTES que ordinales simples.
  const compoundMatch = norm.match(
    new RegExp(`\\b(?:decima|decimo)\\s+(${COMPOUND_UNIT_PATTERN})\\b`),
  );
  if (compoundMatch?.[1]) {
    const unit = unitValue(compoundMatch[1]);
    if (unit != null) return 10 + unit;
  }

  // CLÁUSULA DÉCIMA (10) — solo si no va seguida de otra unidad
  if (/\bclausula\s+(?:decima|decimo)(?!\s+(?:primera?|segunda?|tercera?|cuarta?|quinta?|sexta?|septima?|setima?|octava?|novena?|primer|segundo|tercero|cuarto|quinto|sexto|septimo?|setimo?|octavo|noveno))\b/.test(norm)) {
    return 10;
  }

  // CLÁUSULA PRIMERA … CLÁUSULA NOVENA
  const clausulaUnitMatch = norm.match(
    new RegExp(`\\bclausula\\s+(${COMPOUND_UNIT_PATTERN})\\b`),
  );
  if (clausulaUnitMatch?.[1]) {
    const unit = unitValue(clausulaUnitMatch[1]);
    if (unit != null) return unit;
  }

  return UNKNOWN_ORDINAL;
}

/** Orden legal: PRIMERA → … → DÉCIMA → DÉCIMA PRIMERA → … → CLÁUSULA FINAL. */
export function sortClausulas(clausulas: ClausulaRecord[]): ClausulaRecord[] {
  return [...clausulas].sort((a, b) => {
    const ordinalDiff = extractClauseOrdinal(a.titulo) - extractClauseOrdinal(b.titulo);
    if (ordinalDiff !== 0) return ordinalDiff;

    const ordenDiff = (a.orden ?? 0) - (b.orden ?? 0);
    if (ordenDiff !== 0) return ordenDiff;

    return a.titulo.localeCompare(b.titulo, "es");
  });
}

/** Clave estable para fusionar cláusulas globales con las del cargo sin duplicar. */
function clauseMergeKey(clausula: ClausulaRecord): string {
  const ordinal = extractClauseOrdinal(clausula.titulo);
  if (ordinal < UNKNOWN_ORDINAL) return `ord-${ordinal}`;

  const normTitle = normalizeClauseTitle(clausula.titulo);
  if (normTitle.length > 0) return `title-${normTitle}`;

  return `id-${clausula.id}`;
}

/**
 * Combina cláusulas globales con las del cargo.
 * Si ambas definen la misma cláusula (p. ej. TERCERA), la del cargo reemplaza a la global.
 */
export function mergeClausulasForContract(
  globals: ClausulaRecord[],
  cargoSpecific: ClausulaRecord[],
): ClausulaRecord[] {
  const merged = new Map<string, ClausulaRecord>();

  for (const clausula of sortClausulas(globals)) {
    merged.set(clauseMergeKey(clausula), clausula);
  }

  for (const clausula of sortClausulas(cargoSpecific)) {
    merged.set(clauseMergeKey(clausula), clausula);
  }

  return sortClausulas([...merged.values()]);
}

/** Valor de `orden` según la posición en el formulario (1.ª cláusula = 10, 2.ª = 20, …). */
export function ordenFromFormIndex(formIndex: number): number {
  return (formIndex + 1) * 10;
}

/** Valor de `orden` en BD según el ordinal legal del título (PRIMERA=10, DÉCIMA PRIMERA=110). */
export function ordenFromClauseTitle(titulo: string, formIndex: number): number {
  const ordinal = extractClauseOrdinal(titulo);
  if (ordinal >= FINAL_ORDINAL) return 9990;
  if (ordinal < UNKNOWN_ORDINAL) return ordinal * 10;
  return ordenFromFormIndex(formIndex);
}

/** Normaliza cláusulas del cargo con orden legal y las devuelve ordenadas. */
export function normalizeCargoClausulas<T extends { id?: string; titulo: string; descripcion: string; orden?: number }>(
  clausulas: T[],
): Array<T & { orden: number }> {
  return clausulas
    .map((clausula, index) => ({
      item: clausula,
      orden: ordenFromClauseTitle(clausula.titulo, index),
    }))
    .sort((a, b) => {
      const ordinalDiff = extractClauseOrdinal(a.item.titulo) - extractClauseOrdinal(b.item.titulo);
      if (ordinalDiff !== 0) return ordinalDiff;
      return a.orden - b.orden;
    })
    .map(({ item, orden }) => ({ ...item, orden }));
}
