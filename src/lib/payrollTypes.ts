/** Datos del trabajador ingresados manualmente para cálculos de nómina (sin BD). */
export interface PayrollWorkerInput {
  nombres: string;
  apellidos: string;
  cedula: string;
  cargo: string;
  sueldoMensualUsd: number;
  fechaIngreso: string;
}

/** Encabezado de empresa opcional para documentos impresos. */
export interface PayrollEmpresaContext {
  nombre: string;
  rif: string;
  direccion: string;
  logoUrl: string | null;
}

export function workerFromVacationForm(data: {
  cedula: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  sueldoMensualUsd: number;
  fechaIngreso: string;
}): PayrollWorkerInput {
  return {
    cedula: data.cedula,
    nombres: data.nombres,
    apellidos: data.apellidos,
    cargo: data.cargo,
    sueldoMensualUsd: data.sueldoMensualUsd,
    fechaIngreso: data.fechaIngreso,
  };
}
