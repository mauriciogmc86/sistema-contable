import {
  addDays,
  completedServiceYears,
  countHolidaysInRange,
  countSundaysInRange,
  daysBetweenInclusive,
  getVacationEndDate,
  getVacationPeriodLabel,
  getVacationStartDate,
  hasCompletedFirstYear,
  toIsoDate,
  vacationBonusDaysArt192,
  vacationDaysArt190,
} from "@/lib/payrollDates";
import { roundPayroll, sueldoDiarioBs, sueldoUsdToBs } from "@/lib/payrollSalary";

export interface VacationCalculationInput {
  fechaIngreso: string;
  sueldoMensualUsd: number;
  tasaBcv: number;
  diasDisfrutados?: number;
  cestaTicketUsd?: number;
  ciudad?: string;
  fechaDocumento?: string;
}

export interface PayrollLineItem {
  label: string;
  legalRef: string;
  days: number;
  rateBs: number;
  totalBs: number;
}

export interface VacationCalculationResult {
  sueldoMensualUsd: number;
  sueldoMensualBs: number;
  tasaBcv: number;
  sueldoDiario: number;
  periodoVacacional: string;
  diasVacaciones: number;
  diasBonoVacacional: number;
  domingosEnPeriodo: number;
  diasFeriados: number;
  diasDisfrutados: number;
  diasCalendario: number;
  fechaInicioVacaciones: string;
  fechaFinVacaciones: string;
  fechaReincorporacion: string;
  asignaciones: PayrollLineItem[];
  deducciones: PayrollLineItem[];
  totalAsignaciones: number;
  totalDeducciones: number;
  totalAPagar: number;
  cestaTicketDetalle: {
    tasaBcv: number;
    usdBase: number;
    usdMensual: number;
    totalBs: number;
  };
}

export function calculateVacationSettlement(input: VacationCalculationInput): VacationCalculationResult {
  if (!hasCompletedFirstYear(input.fechaIngreso)) {
    throw new Error(
      "El trabajador aún no cumple 12 meses ininterrumpidos de servicio. Las vacaciones se calculan después de ese periodo (LOTTT Art. 190).",
    );
  }

  const startDate = getVacationStartDate(input.fechaIngreso);
  const refDate = startDate;
  const years = completedServiceYears(input.fechaIngreso, refDate);

  const diasVacaciones = vacationDaysArt190(input.fechaIngreso, refDate);
  const diasBono = vacationBonusDaysArt192(input.fechaIngreso, refDate);
  const fechaInicio = toIsoDate(startDate);
  const fechaFin = getVacationEndDate(input.fechaIngreso, diasVacaciones, refDate);

  const domingos = countSundaysInRange(fechaInicio, fechaFin);
  const feriados = countHolidaysInRange(fechaInicio, fechaFin);
  const disfrutados = input.diasDisfrutados ?? 0;

  const sueldoMensualBs = sueldoUsdToBs(input.sueldoMensualUsd, input.tasaBcv);
  const sueldoDiario = sueldoDiarioBs(sueldoMensualBs);
  const vacacionesTotal = roundPayroll(diasVacaciones * sueldoDiario);
  const bonoTotal = roundPayroll(diasBono * sueldoDiario);
  const domingosTotal = roundPayroll(domingos * (diasVacaciones / 7) * sueldoDiario * 2);
  const feriadosTotal = roundPayroll(feriados * sueldoDiario);

  const cestaUsd = input.cestaTicketUsd ?? 20;
  const cestaTotal = roundPayroll(input.tasaBcv * cestaUsd);
  const deduccionTotal = roundPayroll(disfrutados * sueldoDiario);

  const asignaciones: PayrollLineItem[] = [
    {
      label: "Vacaciones",
      legalRef: "Art. 190 LOTTT",
      days: diasVacaciones,
      rateBs: vacacionesTotal,
      totalBs: vacacionesTotal,
    },
    {
      label: "Bono Vacacional",
      legalRef: "Art. 192 LOTTT",
      days: diasBono,
      rateBs: bonoTotal,
      totalBs: bonoTotal,
    },
    {
      label: "Domingos",
      legalRef: "Art. 184 L(a) LOTTT",
      days: domingos,
      rateBs: roundPayroll(sueldoDiario * 2),
      totalBs: domingosTotal,
    },
    {
      label: "Días Feriados",
      legalRef: "Art. 119 LOTTT",
      days: feriados,
      rateBs: sueldoDiario,
      totalBs: feriadosTotal,
    },
    {
      label: "Cesta Ticket",
      legalRef: "Gaceta Oficial 6.746 Del 1 de Myo 2.023",
      days: 0,
      rateBs: cestaTotal,
      totalBs: cestaTotal,
    },
  ];

  const deducciones: PayrollLineItem[] = [
    {
      label: "Días Disfrutados",
      legalRef: "",
      days: disfrutados,
      rateBs: sueldoDiario,
      totalBs: deduccionTotal,
    },
  ];

  const totalAsignaciones = roundPayroll(asignaciones.reduce((s, l) => s + l.totalBs, 0));
  const totalDeducciones = roundPayroll(deducciones.reduce((s, l) => s + l.totalBs, 0));
  const reincorporacion = addDays(fechaFin, 1);

  return {
    sueldoMensualUsd: input.sueldoMensualUsd,
    sueldoMensualBs,
    tasaBcv: input.tasaBcv,
    sueldoDiario,
    periodoVacacional: getVacationPeriodLabel(input.fechaIngreso, years),
    diasVacaciones,
    diasBonoVacacional: diasBono,
    domingosEnPeriodo: domingos,
    diasFeriados: feriados,
    diasDisfrutados: disfrutados,
    diasCalendario: daysBetweenInclusive(fechaInicio, fechaFin),
    fechaInicioVacaciones: fechaInicio,
    fechaFinVacaciones: fechaFin,
    fechaReincorporacion: toIsoDate(reincorporacion),
    asignaciones,
    deducciones,
    totalAsignaciones,
    totalDeducciones,
    totalAPagar: roundPayroll(totalAsignaciones - totalDeducciones),
    cestaTicketDetalle: {
      tasaBcv: input.tasaBcv,
      usdBase: cestaUsd,
      usdMensual: 40,
      totalBs: cestaTotal,
    },
  };
}

export interface LiquidationInput {
  sueldoMensualUsd: number;
  tasaBcv: number;
  diasTrabajados: number;
  diasVacacionesPendientes?: number;
  diasBonoVacacional?: number;
  cestaTicketUsd?: number;
}

export interface LiquidationResult {
  sueldoMensualUsd: number;
  sueldoMensualBs: number;
  tasaBcv: number;
  sueldoDiario: number;
  asignaciones: PayrollLineItem[];
  totalAPagar: number;
}

export function calculateLiquidation(input: LiquidationInput): LiquidationResult {
  const sueldoMensualBs = sueldoUsdToBs(input.sueldoMensualUsd, input.tasaBcv);
  const sueldoDiario = sueldoDiarioBs(sueldoMensualBs);
  const diasVac = input.diasVacacionesPendientes ?? 15;
  const diasBono = input.diasBonoVacacional ?? diasVac;

  const sueldoPendiente = roundPayroll(sueldoDiario * input.diasTrabajados);
  const vacaciones = roundPayroll(diasVac * sueldoDiario);
  const bono = roundPayroll(diasBono * sueldoDiario);
  const prestaciones = roundPayroll(sueldoMensualBs * 2);
  const cestaUsd = input.cestaTicketUsd ?? 20;
  const cesta = roundPayroll(input.tasaBcv * cestaUsd);

  const asignaciones: PayrollLineItem[] = [
    { label: "Sueldo pendiente", legalRef: "Art. 104 LOTTT", days: input.diasTrabajados, rateBs: sueldoDiario, totalBs: sueldoPendiente },
    { label: "Vacaciones fraccionadas", legalRef: "Art. 190 LOTTT", days: diasVac, rateBs: vacaciones, totalBs: vacaciones },
    { label: "Bono vacacional", legalRef: "Art. 192 LOTTT", days: diasBono, rateBs: bono, totalBs: bono },
    { label: "Prestaciones sociales", legalRef: "Art. 142 LOTTT", days: 0, rateBs: prestaciones, totalBs: prestaciones },
  ];

  if (cesta > 0) {
    asignaciones.push({
      label: "Cesta Ticket",
      legalRef: "Gaceta Oficial 6.746",
      days: 0,
      rateBs: cesta,
      totalBs: cesta,
    });
  }

  return {
    sueldoMensualUsd: input.sueldoMensualUsd,
    sueldoMensualBs,
    tasaBcv: input.tasaBcv,
    sueldoDiario,
    asignaciones,
    totalAPagar: roundPayroll(asignaciones.reduce((s, l) => s + l.totalBs, 0)),
  };
}
