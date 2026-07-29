import { supabase } from "@/lib/supabase";
import type { ClausulaGlobalInput } from "@/application/validation";
import type { ClausulaRecord } from "./SupabaseCargoRepository";
import { mergeClausulasForContract } from "@/lib/clausulaOrdering";

export type { ClausulaRecord };

export async function listGlobalClausulas(): Promise<ClausulaRecord[]> {
  const { data, error } = await supabase
    .from("clausulas")
    .select("id, titulo, descripcion, cargo_id, es_global, orden")
    .eq("es_global", true)
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ClausulaRecord[]) ?? [];
}

export async function getClausulasForCargo(cargoId: number): Promise<ClausulaRecord[]> {
  const [globals, cargoResult] = await Promise.all([
    listGlobalClausulas(),
    supabase
      .from("clausulas")
      .select("id, titulo, descripcion, cargo_id, es_global, orden")
      .eq("cargo_id", cargoId)
      .order("orden", { ascending: true }),
  ]);

  if (cargoResult.error) throw new Error(cargoResult.error.message);

  const cargoClausulas = ((cargoResult.data as ClausulaRecord[]) ?? []).filter(
    (row) => row.es_global !== true,
  );

  return mergeClausulasForContract(globals, cargoClausulas);
}

export async function createGlobalClausula(input: ClausulaGlobalInput): Promise<ClausulaRecord> {
  const { data, error } = await supabase
    .from("clausulas")
    .insert([{
      titulo: input.titulo.trim(),
      descripcion: input.descripcion.trim(),
      orden: input.orden ?? 0,
      es_global: true,
      cargo_id: null,
    }])
    .select("id, titulo, descripcion, cargo_id, es_global, orden")
    .single();
  if (error) throw new Error(error.message);
  return data as ClausulaRecord;
}

export async function updateClausula(id: string, input: ClausulaGlobalInput): Promise<void> {
  const { error } = await supabase
    .from("clausulas")
    .update({
      titulo: input.titulo.trim(),
      descripcion: input.descripcion.trim(),
      orden: input.orden ?? 0,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteClausula(id: string): Promise<void> {
  const { error } = await supabase.from("clausulas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
