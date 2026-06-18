import { supabase } from "@/lib/supabase";
import type { CargoInput, ClausulaItemInput } from "@/application/validation";

export interface CargoRecord {
  id: number;
  nombre_cargo: string;
  funciones: string;
}

export interface ClausulaRecord {
  id: string;
  titulo: string;
  descripcion: string;
  cargo_id: number | null;
  es_global: boolean;
  orden: number;
}

export interface CargoWithClausulas extends CargoRecord {
  clausulas: ClausulaRecord[];
}

export async function listCargos(): Promise<CargoRecord[]> {
  const { data, error } = await supabase
    .from("cargos")
    .select("id, nombre_cargo, funciones")
    .order("nombre_cargo", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as CargoRecord[]) ?? [];
}

export async function getCargo(id: number): Promise<CargoInput> {
  const { data: cargo, error: cargoError } = await supabase
    .from("cargos")
    .select("id, nombre_cargo, funciones")
    .eq("id", id)
    .single();
  if (cargoError) throw new Error(cargoError.message);

  const { data: clausulas, error: clError } = await supabase
    .from("clausulas")
    .select("id, titulo, descripcion, orden")
    .eq("cargo_id", id)
    .eq("es_global", false)
    .order("orden", { ascending: true });
  if (clError) throw new Error(clError.message);

  return {
    nombre_cargo: cargo.nombre_cargo ?? "",
    funciones: cargo.funciones ?? "",
    clausulas: (clausulas ?? []).map((c) => ({
      id: c.id,
      titulo: c.titulo,
      descripcion: c.descripcion,
      orden: c.orden,
    })),
  };
}

export async function createCargo(input: CargoInput): Promise<CargoRecord> {
  const { data, error } = await supabase
    .from("cargos")
    .insert([{ nombre_cargo: input.nombre_cargo.trim(), funciones: input.funciones?.trim() ?? "" }])
    .select("id, nombre_cargo, funciones")
    .single();
  if (error) throw new Error(error.message);

  if (input.clausulas.length > 0) {
    await syncClausulasForCargo(data.id, input.clausulas);
  }

  return data as CargoRecord;
}

export async function updateCargo(id: number, input: CargoInput): Promise<void> {
  const { error } = await supabase
    .from("cargos")
    .update({ nombre_cargo: input.nombre_cargo.trim(), funciones: input.funciones?.trim() ?? "" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await syncClausulasForCargo(id, input.clausulas);
}

export async function deleteCargo(id: number): Promise<void> {
  const { error } = await supabase.from("cargos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function syncClausulasForCargo(cargoId: number, clausulas: ClausulaItemInput[]): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("clausulas")
    .select("id")
    .eq("cargo_id", cargoId)
    .eq("es_global", false);
  if (fetchError) throw new Error(fetchError.message);

  const existingIds = new Set((existing ?? []).map((c) => c.id));
  const incomingWithId = clausulas.filter((c) => c.id && existingIds.has(c.id));
  const incomingNew = clausulas.filter((c) => !c.id || !existingIds.has(c.id));
  const incomingIds = new Set(incomingWithId.map((c) => c.id!));
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase.from("clausulas").delete().in("id", toDelete);
    if (error) throw new Error(error.message);
  }

  for (const c of incomingWithId) {
    const { error } = await supabase
      .from("clausulas")
      .update({ titulo: c.titulo, descripcion: c.descripcion, orden: c.orden ?? 0 })
      .eq("id", c.id!);
    if (error) throw new Error(error.message);
  }

  if (incomingNew.length > 0) {
    const { error } = await supabase.from("clausulas").insert(
      incomingNew.map((c, i) => ({
        titulo: c.titulo,
        descripcion: c.descripcion,
        orden: c.orden ?? i,
        cargo_id: cargoId,
        es_global: false,
      })),
    );
    if (error) throw new Error(error.message);
  }
}
