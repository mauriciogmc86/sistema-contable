export function roundPayroll(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Convierte sueldo mensual en USD a bolívares según tasa BCV del día. */
export function sueldoUsdToBs(usd: number, tasaBcv: number): number {
  return roundPayroll(usd * tasaBcv);
}

/** Sueldo diario en bolívares (base mensual Bs. / 30). */
export function sueldoDiarioBs(sueldoMensualBs: number): number {
  return roundPayroll(sueldoMensualBs / 30);
}

/** Sueldo diario en dólares (base mensual USD / 30). */
export function sueldoDiarioUsd(sueldoMensualUsd: number): number {
  return roundPayroll(sueldoMensualUsd / 30);
}
