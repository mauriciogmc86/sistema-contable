import { supabase } from "@/lib/supabase";
import type { CargoInput, ClausulaItemInput } from "@/application/validation";
import { normalizeCargoClausulas } from "@/lib/clausulaOrdering";
import { getClausulasForCargo } from "@/infrastructure/repositories/SupabaseClausulaRepository";

export interface CargoRecord {
  id: number;
  nombre_cargo: string;
  funciones: string;
  clausulas_count?: number;
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
  const [{ data: cargos, error }, { data: clausulaRows, error: clError }] = await Promise.all([
    supabase.from("cargos").select("id, nombre_cargo, funciones").order("nombre_cargo", { ascending: true }),
    supabase.from("clausulas").select("cargo_id").not("cargo_id", "is", null),
  ]);

  if (error) throw new Error(error.message);
  if (clError) throw new Error(clError.message);

  const counts = new Map<number, number>();
  for (const row of clausulaRows ?? []) {
    if (row.cargo_id == null) continue;
    const id = Number(row.cargo_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return ((cargos as CargoRecord[]) ?? []).map((cargo) => ({
    ...cargo,
    clausulas_count: counts.get(cargo.id) ?? 0,
  }));
}

function mapClausulasForForm(
  clausulas: Array<{ id?: string; titulo: string; descripcion: string; orden: number }>,
): CargoInput["clausulas"] {
  return normalizeCargoClausulas(
    clausulas.map((clausula, index) => ({
      id: clausula.id,
      titulo: clausula.titulo,
      descripcion: clausula.descripcion,
      orden: clausula.orden ?? (index + 1) * 10,
    })),
  ).map(({ id, titulo, descripcion, orden }) => ({
    ...(id ? { id } : {}),
    titulo,
    descripcion,
    orden,
  }));
}

async function fetchClausulasByCargoId(cargoId: number) {
  const { data, error } = await supabase
    .from("clausulas")
    .select("id, titulo, descripcion, orden, es_global, cargo_id")
    .eq("cargo_id", cargoId)
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => row.es_global !== true);
}

export async function getCargo(id: number): Promise<CargoInput> {
  const { data: cargo, error: cargoError } = await supabase
    .from("cargos")
    .select("id, nombre_cargo, funciones")
    .eq("id", id)
    .single();
  if (cargoError) throw new Error(cargoError.message);

  const rows = await fetchClausulasByCargoId(id);

  return {
    nombre_cargo: cargo.nombre_cargo ?? "",
    funciones: cargo.funciones ?? "",
    clausulas: mapClausulasForForm(rows),
  };
}

/** Carga un cargo para duplicar: cláusulas propias o, si no hay, las efectivas del contrato. */
export async function getCargoForDuplicate(id: number): Promise<CargoInput> {
  const base = await getCargo(id);

  if (base.clausulas.length > 0) {
    return base;
  }

  const effective = await getClausulasForCargo(id);
  return {
    ...base,
    clausulas: mapClausulasForForm(
      effective.map(({ titulo, descripcion, orden }) => ({ titulo, descripcion, orden })),
    ),
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
    .eq("cargo_id", cargoId);
  if (fetchError) throw new Error(fetchError.message);

  const existingIds = new Set((existing ?? []).map((c) => c.id));
  const incomingIds = new Set(
    clausulas.map((c) => c.id).filter((id): id is string => !!id && existingIds.has(id)),
  );
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase.from("clausulas").delete().in("id", toDelete);
    if (error) throw new Error(error.message);
  }

  const normalized = normalizeCargoClausulas(clausulas);

  for (const clausula of normalized) {
    const payload = {
      titulo: clausula.titulo,
      descripcion: clausula.descripcion,
      orden: clausula.orden,
    };

    if (clausula.id && existingIds.has(clausula.id)) {
      const { error } = await supabase
        .from("clausulas")
        .update(payload)
        .eq("id", clausula.id);
      if (error) throw new Error(error.message);
      continue;
    }

    const { error } = await supabase.from("clausulas").insert({
      ...payload,
      cargo_id: cargoId,
      es_global: false,
    });
    if (error) throw new Error(error.message);
  }
}
