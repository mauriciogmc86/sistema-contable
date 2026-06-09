import type { EmpresaInput, TrabajadorInput } from "@/application/validation";
import { supabase } from "@/lib/supabase";

export interface EmpresaRecord {
  id: string;
  nombre: string;
  rif: string;
  direccion_fiscal: string | null;
}

export interface TrabajadorRecord {
  id: string;
  cedula: string;
  primer_nombre: string | null;
  primer_apellido: string | null;
  salario_base: number | null;
}

export async function listEmpresas(): Promise<EmpresaRecord[]> {
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre, rif, direccion_fiscal")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as EmpresaRecord[]) ?? [];
}

export async function createEmpresa(input: EmpresaInput): Promise<EmpresaRecord> {
  const { data, error } = await supabase
    .from("empresas")
    .insert([
      {
        rif: input.rif,
        nombre: input.nombre,
        direccion_fiscal: input.direccion || null,
        registro_mercantil: input.registro_mercantil || null,
        tomo_numero: input.tomo_numero || null,
        numero_registro: input.numero_registro || null,
        fecha_constitucion: input.fecha_constitucion || null,
      },
    ])
    .select("id, nombre, rif, direccion_fiscal")
    .single();
  if (error) throw new Error(error.message);

  if (input.representante_cedula) {
    await supabase.from("representantes").insert([
      {
        empresa_id: data.id,
        nombre_completo: input.representante_nombre || "",
        cedula: input.representante_cedula,
        profesion_cargo: input.representante_profesion || "",
      },
    ]);
  }

  return data as EmpresaRecord;
}

export async function deleteEmpresa(id: string): Promise<void> {
  const { error } = await supabase.from("empresas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listTrabajadores(empresaId: string): Promise<TrabajadorRecord[]> {
  const { data, error } = await supabase
    .from("trabajadores")
    .select("id, cedula, primer_nombre, primer_apellido, salario_base")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as TrabajadorRecord[]) ?? [];
}

export async function createTrabajador(empresaId: string, input: TrabajadorInput): Promise<void> {
  const nombres = input.nombres.trim().split(/\s+/);
  const apellidos = input.apellidos.trim().split(/\s+/);

  let cargoId: string | null = null;
  if (input.cargo_nombre?.trim()) {
    const { data: existingCargo } = await supabase
      .from("cargos")
      .select("id")
      .ilike("nombre_cargo", input.cargo_nombre.trim())
      .maybeSingle();

    if (existingCargo?.id) {
      cargoId = existingCargo.id;
    } else {
      const { data: newCargo, error: cargoError } = await supabase
        .from("cargos")
        .insert([{ nombre_cargo: input.cargo_nombre.trim() }])
        .select("id")
        .single();
      if (cargoError) throw new Error(cargoError.message);
      cargoId = newCargo?.id ?? null;
    }
  }

  const { error } = await supabase.from("trabajadores").insert([
    {
      empresa_id: empresaId,
      cedula: input.cedula,
      primer_nombre: nombres[0] ?? "",
      segundo_nombre: nombres.slice(1).join(" ") || null,
      primer_apellido: apellidos[0] ?? "",
      segundo_apellido: apellidos.slice(1).join(" ") || null,
      fecha_nacimiento: input.fecha_nacimiento,
      estado_civil: input.estado_civil,
      direccion_habitacion: input.direccion_habitacion,
      salario_base: input.sueldo_base,
      cargo_id: cargoId,
    },
  ]);
  if (error) throw new Error(error.message);
}

export async function deleteTrabajador(id: string): Promise<void> {
  const { error } = await supabase.from("trabajadores").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
