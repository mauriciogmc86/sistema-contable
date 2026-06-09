/** Pure utility functions for contract generation */

const DIAS_SEMANA = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const UNIDADES = [
  "", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete",
  "Ocho", "Nueve", "Diez", "Once", "Doce", "Trece", "Catorce",
  "Quince", "Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve",
];

const DECENAS = [
  "", "", "Veinte", "Treinta", "Cuarenta", "Cincuenta",
  "Sesenta", "Setenta", "Ochenta", "Noventa",
];

const VEINTE = [
  "Veinte", "Veintiuno", "Veintidós", "Veintitrés", "Veinticuatro",
  "Veinticinco", "Veintiséis", "Veintisiete", "Veintiocho", "Veintinueve",
];

const CENTENAS = [
  "", "Ciento", "Doscientos", "Trescientos", "Cuatrocientos", "Quinientos",
  "Seiscientos", "Setecientos", "Ochocientos", "Novecientos",
];

function decenas(n: number): string {
  if (n === 100) return "Cien";
  if (n < 20) return UNIDADES[n] ?? "";
  if (n < 30) return VEINTE[n - 20] ?? "";
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} y ${UNIDADES[u]}`;
}

function centenas(n: number): string {
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c === 0) return decenas(resto);
  if (resto === 0) return CENTENAS[c] ?? "";
  return `${CENTENAS[c]} ${decenas(resto)}`;
}

/** Converts a non-negative integer ≤ 999 999 to Spanish words. */
export function numeroALetras(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  const entero = Math.floor(n);
  if (entero === 0) return "Cero";

  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;

  let resultado = "";
  if (miles > 0) {
    resultado += miles === 1 ? "Mil" : `${centenas(miles)} Mil`;
  }
  if (resto > 0) {
    resultado += resultado ? ` ${centenas(resto)}` : centenas(resto);
  }
  return resultado.trim();
}

/** Converts a number to Spanish words with currency suffix.
 *  e.g.  130 → "Ciento Treinta Bolívares (Bs. 130,00)"
 *        45.50 → "Cuarenta y Cinco Bolívares con Cincuenta Céntimos (Bs. 45,50)"
 */
export function montoEnLetras(value: number, currency: "VES" | "USD" = "VES"): string {
  const entero = Math.floor(value);
  const decimales = Math.round((value - entero) * 100);
  const currencyName = currency === "USD" ? "Dólares" : "Bolívares";
  const centName = currency === "USD" ? "Centavos" : "Céntimos";
  const currencySymbol = currency === "USD" ? "USD" : "Bs.";

  const formatted = value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let letras = `${numeroALetras(entero)} ${currencyName}`;
  if (decimales > 0) {
    letras += ` con ${numeroALetras(decimales)} ${centName}`;
  }
  return `${letras} (${currencySymbol} ${formatted})`;
}

const NUMEROS_ORDINALES: Record<number, string> = {
  1: "Primero", 2: "Segundo", 3: "Tercero", 4: "Cuarto", 5: "Quinto",
  6: "Sexto", 7: "Séptimo", 8: "Octavo", 9: "Noveno", 10: "Décimo",
  11: "Undécimo", 12: "Duodécimo", 13: "Decimotercero", 14: "Decimocuarto",
  15: "Decimoquinto", 16: "Decimosexto", 17: "Decimoséptimo",
  18: "Decimoctavo", 19: "Decimonoveno", 20: "Vigésimo",
  21: "Vigésimo Primero", 22: "Vigésimo Segundo", 23: "Vigésimo Tercero",
  24: "Vigésimo Cuarto", 25: "Vigésimo Quinto", 26: "Vigésimo Sexto",
  27: "Vigésimo Séptimo", 28: "Vigésimo Octavo", 29: "Vigésimo Noveno",
  30: "Trigésimo", 31: "Trigésimo Primero",
};

/**
 * Formats a date as: "Lunes Veintiséis (26) de Enero de 2026"
 * Used for contract start/end dates and signature lines.
 */
export function fechaEnLetras(date: Date): string {
  const diaSemana = DIAS_SEMANA[date.getDay()];
  const dia = date.getDate();
  const mes = MESES[date.getMonth()];
  const anio = date.getFullYear();
  const diaLetras = NUMEROS_ORDINALES[dia] ?? numeroALetras(dia);
  return `${diaSemana} ${diaLetras} (${dia}) de ${mes} de ${anio}`;
}

/**
 * Formats a date as short numeric: "26/01/2026"
 */
export function fechaNumerica(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export interface Edad {
  años: number;
  meses: number;
  dias: number;
}

/**
 * Calculates exact age from an ISO date string (YYYY-MM-DD) to today.
 */
export function calcularEdad(fechaNacimiento: string): Edad {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return { años: 0, meses: 0, dias: 0 };

  let años = hoy.getFullYear() - nac.getFullYear();
  let meses = hoy.getMonth() - nac.getMonth();
  let dias = hoy.getDate() - nac.getDate();

  if (dias < 0) {
    meses -= 1;
    const diasDelMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    dias += diasDelMesAnterior;
  }
  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  return { años, meses, dias };
}

/**
 * Formats edad as Spanish text: "(56 años, 3 Meses y 25 Días)"
 */
export function edadEnLetras(edad: Edad): string {
  return `(${edad.años} años, ${edad.meses} Meses y ${edad.dias} Días)`;
}

/**
 * Returns a date +N months from the given date.
 */
export function sumarMeses(date: Date, meses: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + meses);
  return result;
}
