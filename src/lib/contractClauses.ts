import type { ContractData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import {
  fechaEnLetras,
  fechaNumerica,
  montoEnLetras,
  sumarMeses,
} from "@/lib/contractUtils";

export interface ClauseContext {
  empresa: string;
  direccion_empresa: string;
  cargo: string;
  salario: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_inicio_num: string;
}

export interface ClauseToken {
  token: string;
  label: string;
  example: string;
}

export const CLAUSE_TOKENS: ClauseToken[] = [
  { token: "{{cargo}}", label: "Cargo del trabajador", example: "CHOFER" },
  { token: "{{empresa}}", label: "Nombre de la empresa", example: "Distribuidora XYZ C.A." },
  { token: "{{direccion_empresa}}", label: "Dirección fiscal", example: "Av. Principal, Maracaibo" },
  { token: "{{salario}}", label: "Salario en letras + monto", example: "Ciento Treinta Bolívares (Bs. 130,00) Art 129 LOTTT" },
  { token: "{{fecha_inicio}}", label: "Fecha de inicio en letras", example: "Lunes Primero (1) de Enero de 2026" },
  { token: "{{fecha_fin}}", label: "Fecha de fin en letras (6 meses)", example: "Martes Primero (1) de Julio de 2026" },
  { token: "{{fecha_inicio_num}}", label: "Fecha de inicio numérica", example: "01/01/2026" },
];

const BLANK = "________";

export function buildClauseContext(data: ContractData): ClauseContext {
  const { empleado, empresa } = data;

  const hoy = new Date();
  const fechaFin = sumarMeses(hoy, 6);

  return {
    empresa: empresa?.nombre || BLANK,
    direccion_empresa: empresa?.direccion_fiscal || BLANK,
    cargo: empleado.cargos?.nombre_cargo || BLANK,
    salario: montoEnLetras(empleado.salario_base ?? 0),
    fecha_inicio: fechaEnLetras(hoy),
    fecha_fin: fechaEnLetras(fechaFin),
    fecha_inicio_num: fechaNumerica(hoy),
  };
}

export function resolveClauseText(descripcion: string, ctx: ClauseContext): string {
  return descripcion
    .replace(/\{\{empresa\}\}/g, ctx.empresa)
    .replace(/\{\{direccion_empresa\}\}/g, ctx.direccion_empresa)
    .replace(/\{\{cargo\}\}/g, ctx.cargo)
    .replace(/\{\{salario\}\}/g, ctx.salario)
    .replace(/\{\{fecha_inicio\}\}/g, ctx.fecha_inicio)
    .replace(/\{\{fecha_fin\}\}/g, ctx.fecha_fin)
    .replace(/\{\{fecha_inicio_num\}\}/g, ctx.fecha_inicio_num);
}
