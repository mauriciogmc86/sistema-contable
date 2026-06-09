import { supabase } from "@/lib/supabase";

export interface TrabajadorRow {
  cedula: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  estado_civil?: string;
  direccion_habitacion?: string;
  fecha_nacimiento?: string;
  salario_base?: number;
  empresa_id?: string;
  cargos?: { nombre_cargo?: string } | null;
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
  representantes?: RepresentanteRow[];
}

export interface ContractData {
  empleado: TrabajadorRow;
  empresa: EmpresaLegalRow | null;
}

/** Read-only access to the legal/contract data sources. */
export async function getContractByCedula(cedula: string): Promise<ContractData | null> {
  const { data: empleado, error } = await supabase
    .from("trabajadores")
    .select("*, cargos(*)")
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
