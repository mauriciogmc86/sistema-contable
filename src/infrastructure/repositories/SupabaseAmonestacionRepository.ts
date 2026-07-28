import { supabase } from "@/lib/supabase";
import {
  fetchWorkerWithEmpresaByCedula,
  type WorkerDocumentData,
} from "@/infrastructure/repositories/SupabaseLegalRepository";
import { getClausulasForCargo, listGlobalClausulas } from "@/infrastructure/repositories/SupabaseClausulaRepository";
import { buildDefaultClausulaText } from "@/lib/amonestacionUtils";
import { normalizeCedula } from "@/lib/venezuelanId";

export interface AmonestacionRecord {
  id: string;
  trabajador_id: string;
  secuencia_global: number;
  numero_trabajador: number;
  codigo: string;
  clausula: string;
  ciudad: string;
  fecha_documento: string;
  created_at: string;
}

export interface AmonestacionWorkerContext extends WorkerDocumentData {
  trabajadorId: string;
  amonestacionesPrevias: number;
  siguienteNumero: number;
  clausulaSugerida: string;
}

export interface CreateAmonestacionInput {
  trabajadorId: string;
  clausula: string;
  ciudad?: string;
  fechaDocumento?: string;
}

async function countAmonestacionesByTrabajadorId(trabajadorId: string): Promise<number> {
  const { count, error } = await supabase
    .from("amonestaciones")
    .select("id", { count: "exact", head: true })
    .eq("trabajador_id", trabajadorId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Trabajador + empresa + historial de amonestaciones para generar documento. */
export async function getAmonestacionContextByCedula(
  cedula: string,
): Promise<AmonestacionWorkerContext | null> {
  const base = await fetchWorkerWithEmpresaByCedula(cedula);
  if (!base) return null;

  const trabajadorId = (base.empleado as { id?: string }).id;
  if (!trabajadorId) throw new Error("El trabajador no tiene identificador válido.");

  const cargoId = (base.empleado.cargos as { id?: number } | null)?.id;
  const clausulas = cargoId
    ? await getClausulasForCargo(cargoId)
    : await listGlobalClausulas();

  const amonestacionesPrevias = await countAmonestacionesByTrabajadorId(trabajadorId);

  return {
    ...base,
    trabajadorId,
    amonestacionesPrevias,
    siguienteNumero: amonestacionesPrevias + 1,
    clausulaSugerida: buildDefaultClausulaText(clausulas, base.empleado.fecha_ingreso),
  };
}

/** Crea la amonestación en BD y asigna numeración global + por trabajador. */
export async function createAmonestacion(input: CreateAmonestacionInput): Promise<AmonestacionRecord> {
  const { data, error } = await supabase.rpc("crear_amonestacion", {
    p_trabajador_id: input.trabajadorId,
    p_clausula: input.clausula.trim(),
    p_ciudad: input.ciudad?.trim() || "Maracaibo",
    p_fecha_documento: input.fechaDocumento ?? new Date().toISOString().slice(0, 10),
  });

  if (error) throw new Error(error.message);
  return data as AmonestacionRecord;
}

export async function listAmonestacionesByTrabajadorId(trabajadorId: string): Promise<AmonestacionRecord[]> {
  const { data, error } = await supabase
    .from("amonestaciones")
    .select("*")
    .eq("trabajador_id", trabajadorId)
    .order("numero_trabajador", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as AmonestacionRecord[]) ?? [];
}

export async function deleteAmonestacionById(id: string): Promise<void> {
  const { error } = await supabase.rpc("eliminar_amonestacion", { p_amonestacion_id: id });
  if (error) throw new Error(error.message);
}

export async function deleteAllAmonestacionesByTrabajadorId(trabajadorId: string): Promise<number> {
  const { data, error } = await supabase.rpc("eliminar_amonestaciones_por_trabajador", {
    p_trabajador_id: trabajadorId,
  });
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}

/** Elimina todas las amonestaciones registradas para una cédula. */
export async function deleteAmonestacionesByCedula(cedula: string): Promise<number> {
  const normalized = normalizeCedula(cedula);
  const base = await fetchWorkerWithEmpresaByCedula(normalized);
  if (!base) throw new Error("No se encontró un trabajador con esa cédula.");

  const trabajadorId = (base.empleado as { id?: string }).id;
  if (!trabajadorId) throw new Error("El trabajador no tiene identificador válido.");

  return deleteAllAmonestacionesByTrabajadorId(trabajadorId);
}
