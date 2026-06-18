import { supabase } from "@/lib/supabase";
import { normalizeCedula, normalizeRif } from "@/lib/venezuelanId";

export async function existsTrabajadorCedula(cedula: string, excludeTrabajadorId?: string): Promise<boolean> {
  const normalized = normalizeCedula(cedula);
  if (!normalized) return false;

  let query = supabase.from("trabajadores").select("id").eq("cedula", normalized);
  if (excludeTrabajadorId) query = query.neq("id", excludeTrabajadorId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function existsEmpresaRif(rif: string, excludeEmpresaId?: string): Promise<boolean> {
  const normalized = normalizeRif(rif);
  if (!normalized || !normalized.startsWith("J-")) return false;

  let query = supabase.from("empresas").select("id").eq("rif", normalized);
  if (excludeEmpresaId) query = query.neq("id", excludeEmpresaId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function existsCargoNombre(nombre: string, excludeId?: number): Promise<boolean> {
  const trimmed = nombre.trim();
  if (!trimmed) return false;

  let query = supabase.from("cargos").select("id").ilike("nombre_cargo", trimmed);
  if (excludeId !== undefined) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
