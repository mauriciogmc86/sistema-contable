import { supabase } from "@/lib/supabase";
import { getClausulasForCargo, listGlobalClausulas, type ClausulaRecord } from "./SupabaseClausulaRepository";

export type { ClausulaRecord };

export interface TrabajadorRow {
  id?: string;
  cedula: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  estado_civil?: string;
  direccion_habitacion?: string;
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  salario_base?: number;
  empresa_id?: string;
  cargos?: { id?: number; nombre_cargo?: string } | null;
}

export interface RepresentanteRow {
  nombre_completo?: string;
  cedula?: string;
  profesion_cargo?: string;
}

export interface EmpresaLegalRow {
  nombre?: string;
  rif?: string;
  direccion_fiscal?: string;
  registro_mercantil?: string;
  fecha_constitucion?: string;
  numero_registro?: string;
  tomo_numero?: string;
  logo_url?: string | null;
  representantes?: RepresentanteRow[];
}

export interface WorkerDocumentData {
  empleado: TrabajadorRow;
  empresa: EmpresaLegalRow | null;
}

export interface ContractData extends WorkerDocumentData {
  clausulas: ClausulaRecord[];
}

async function fetchWorkerWithEmpresaByCedula(cedula: string): Promise<WorkerDocumentData | null> {
  const { data: empleado, error } = await supabase
    .from("trabajadores")
    .select("*, cargos(id, nombre_cargo)")
    .eq("cedula", cedula)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!empleado) return null;

  let empresa: EmpresaLegalRow | null = null;
  if (empleado.empresa_id) {
    const { data } = await supabase
      .from("empresas")
      .select("*, representantes(*)")
      .eq("id", empleado.empresa_id)
      .maybeSingle();
    empresa = (data as EmpresaLegalRow) ?? null;
  }

  return { empleado: empleado as TrabajadorRow, empresa };
}

export { fetchWorkerWithEmpresaByCedula };

/** Trabajador + empresa para documentos de nómina (carta de trabajo, amonestaciones). */
export async function getWorkerDocumentByCedula(cedula: string): Promise<WorkerDocumentData | null> {
  return fetchWorkerWithEmpresaByCedula(cedula);
}

/** Read-only access to the legal/contract data sources. */
export async function getContractByCedula(cedula: string): Promise<ContractData | null> {
  const base = await fetchWorkerWithEmpresaByCedula(cedula);
  if (!base) return null;

  const cargoId = (base.empleado.cargos as { id?: number } | null)?.id;
  const clausulas = cargoId
    ? await getClausulasForCargo(cargoId)
    : await listGlobalClausulas();

  return { ...base, clausulas };
}
