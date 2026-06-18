import { completedServiceYears, parseIsoDate } from "@/lib/payrollDates";
import { montoEnLetras, numeroALetras } from "@/lib/contractUtils";
import { roundPayroll, sueldoUsdToBs } from "@/lib/payrollSalary";
import type { TrabajadorRow } from "@/infrastructure/repositories/SupabaseLegalRepository";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function fullWorkerName(empleado: TrabajadorRow): string {
  return [
    empleado.primer_nombre,
    empleado.segundo_nombre,
    empleado.primer_apellido,
    empleado.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function workerCargo(empleado: TrabajadorRow): string {
  return empleado.cargos?.nombre_cargo?.trim() ?? "";
}

export interface ConstitucionDateParts {
  dia: string;
  mes: string;
  anio: string;
}

export function constitucionDateParts(fechaConstitucion?: string): ConstitucionDateParts {
  if (!fechaConstitucion) return { dia: "—", mes: "—", anio: "—" };
  const date = parseIsoDate(fechaConstitucion);
  return {
    dia: String(date.getDate()),
    mes: MESES[date.getMonth()] ?? "—",
    anio: String(date.getFullYear()),
  };
}

export interface ServiceYearsDescription {
  years: number;
  enLetras: string;
  enNumeros: string;
}

export function serviceYearsDescription(
  fechaIngreso: string,
  referenceDate = new Date(),
): ServiceYearsDescription {
  const years = completedServiceYears(fechaIngreso, referenceDate);
  const letras = years === 1 ? "Un" : numeroALetras(years);
  return {
    years,
    enLetras: letras,
    enNumeros: String(years).padStart(2, "0"),
  };
}

export type ConversionCurrency = "USD" | "EUR";

export interface CartaTrabajoSalary {
  sueldoMensualUsd: number;
  sueldoMensualBs: number;
  sueldoMensualBsLetras: string;
  sueldoExtranjero: number;
  sueldoExtranjeroLetras: string;
  monedaExtranjera: ConversionCurrency;
  monedaExtranjeraLabel: string;
  tasaBcv: number;
}

export function buildCartaTrabajoSalary(
  salarioBaseUsd: number,
  tasaBcv: number,
  monedaExtranjera: ConversionCurrency,
): CartaTrabajoSalary {
  const sueldoMensualUsd = roundPayroll(salarioBaseUsd);
  const sueldoMensualBs = sueldoUsdToBs(sueldoMensualUsd, tasaBcv);
  const monedaExtranjeraLabel =
    monedaExtranjera === "EUR"
      ? "Euros"
      : "Dólares de los Estados Unidos de América";
  const sueldoExtranjero = sueldoMensualUsd;
  const formattedExtranjero = formatForeignAmount(sueldoExtranjero, monedaExtranjera);
  const sueldoExtranjeroLetras =
    monedaExtranjera === "EUR"
      ? `${numeroALetras(Math.floor(sueldoExtranjero))} ${monedaExtranjeraLabel} (${formattedExtranjero})`
      : montoEnLetras(sueldoExtranjero, "USD").replace(
          "Dólares",
          "Dólares de los Estados Unidos de América",
        );

  return {
    sueldoMensualUsd,
    sueldoMensualBs,
    sueldoMensualBsLetras: montoEnLetras(sueldoMensualBs, "VES"),
    sueldoExtranjero,
    sueldoExtranjeroLetras,
    monedaExtranjera,
    monedaExtranjeraLabel,
    tasaBcv,
  };
}

export function formatBsAmount(value: number): string {
  return value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatForeignAmount(value: number, currency: ConversionCurrency): string {
  const symbol = currency === "EUR" ? "EUR" : "USD";
  return `${symbol} ${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
