import type { EmpresaInput, TrabajadorInput } from "@/application/validation";
import { uploadEmpresaLogo } from "@/lib/empresaLogoStorage";
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
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  salario_base: number | null;
}

async function resolveCargoId(cargoNombre: string): Promise<string | null> {
  const nombre = cargoNombre.trim();
  if (!nombre) return null;

  const { data: existingCargo } = await supabase
    .from("cargos")
    .select("id")
    .ilike("nombre_cargo", nombre)
    .maybeSingle();

  if (existingCargo?.id) return String(existingCargo.id);

  const { data: newCargo, error: cargoError } = await supabase
    .from("cargos")
    .insert([{ nombre_cargo: nombre, funciones: "" }])
    .select("id")
    .single();
  if (cargoError) throw new Error(cargoError.message);
  return newCargo?.id != null ? String(newCargo.id) : null;
}

function hasRepresentanteData(input: EmpresaInput): boolean {
  return Boolean(
    input.representante_cedula?.trim() ||
      input.representante_nombre?.trim() ||
      input.representante_profesion?.trim(),
  );
}

async function upsertRepresentante(empresaId: string, input: EmpresaInput): Promise<void> {
  if (!hasRepresentanteData(input)) {
    const { error } = await supabase.from("representantes").delete().eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
    return;
  }

  if (!input.representante_cedula?.trim()) {
    throw new Error("La cédula del representante legal es requerida cuando ingresas sus datos.");
  }

  const repPayload = {
    empresa_id: empresaId,
    nombre_completo: input.representante_nombre?.trim() || "",
    cedula: input.representante_cedula,
    profesion_cargo: input.representante_profesion?.trim() || "",
  };

  const { data: existing, error: fetchError } = await supabase
    .from("representantes")
    .select("id")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);

  if (existing?.id) {
    const { error } = await supabase.from("representantes").update(repPayload).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("representantes").insert([repPayload]);
    if (error) throw new Error(error.message);
  }
}

export async function listEmpresas(): Promise<EmpresaRecord[]> {
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre, rif, direccion_fiscal")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as EmpresaRecord[]) ?? [];
}

export async function createEmpresa(input: EmpresaInput, logoFile?: File | null): Promise<EmpresaRecord> {
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
        logo_url: input.logo_url || null,
      },
    ])
    .select("id, nombre, rif, direccion_fiscal")
    .single();
  if (error) throw new Error(error.message);

  if (logoFile) {
    const logoUrl = await uploadEmpresaLogo(data.id, logoFile);
    await supabase.from("empresas").update({ logo_url: logoUrl }).eq("id", data.id);
  }

  await upsertRepresentante(data.id, input);

  return data as EmpresaRecord;
}

export async function getEmpresa(id: string): Promise<EmpresaInput> {
  const { data, error } = await supabase
    .from("empresas")
    .select("*, representantes(*)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const rep = Array.isArray(data.representantes) ? data.representantes[0] : null;
  return {
    rif: data.rif ?? "",
    nombre: data.nombre ?? "",
    direccion: data.direccion_fiscal ?? "",
    registro_mercantil: data.registro_mercantil ?? "",
    tomo_numero: data.tomo_numero ?? "",
    numero_registro: data.numero_registro ?? "",
    fecha_constitucion: data.fecha_constitucion ?? "",
    representante_nombre: rep?.nombre_completo ?? "",
    representante_cedula: rep?.cedula ?? "",
    representante_profesion: rep?.profesion_cargo ?? "",
    logo_url: data.logo_url ?? "",
  };
}

export async function updateEmpresa(id: string, input: EmpresaInput, logoFile?: File | null): Promise<void> {
  let logoUrl = input.logo_url || null;
  if (logoFile) {
    logoUrl = await uploadEmpresaLogo(id, logoFile);
  }

  const { error } = await supabase
    .from("empresas")
    .update({
      rif: input.rif,
      nombre: input.nombre,
      direccion_fiscal: input.direccion || null,
      registro_mercantil: input.registro_mercantil || null,
      tomo_numero: input.tomo_numero || null,
      numero_registro: input.numero_registro || null,
      fecha_constitucion: input.fecha_constitucion || null,
      logo_url: logoUrl,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await upsertRepresentante(id, input);
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

export async function getTrabajador(id: string): Promise<TrabajadorInput> {
  const { data, error } = await supabase
    .from("trabajadores")
    .select("*, cargos(nombre_cargo)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const cargo = data.cargos as { nombre_cargo?: string } | null;
  const nombres = [data.primer_nombre, data.segundo_nombre].filter(Boolean).join(" ");
  const apellidos = [data.primer_apellido, data.segundo_apellido].filter(Boolean).join(" ");

  return {
    cedula: data.cedula ?? "",
    nombres,
    apellidos,
    fecha_nacimiento: data.fecha_nacimiento ?? "",
    estado_civil: data.estado_civil as TrabajadorInput["estado_civil"],
    cargo_nombre: cargo?.nombre_cargo ?? "",
    direccion_habitacion: data.direccion_habitacion ?? "",
    sueldo_base: Number(data.salario_base) || 0,
    fecha_ingreso: data.fecha_ingreso ?? "",
  };
}

export async function createTrabajador(empresaId: string, input: TrabajadorInput): Promise<void> {
  const nombres = input.nombres.trim().split(/\s+/);
  const apellidos = input.apellidos.trim().split(/\s+/);
  const cargoId = input.cargo_nombre?.trim() ? await resolveCargoId(input.cargo_nombre) : null;

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
      fecha_ingreso: input.fecha_ingreso,
      cargo_id: cargoId,
    },
  ]);
  if (error) throw new Error(error.message);
}

export async function updateTrabajador(id: string, input: TrabajadorInput): Promise<void> {
  const nombres = input.nombres.trim().split(/\s+/);
  const apellidos = input.apellidos.trim().split(/\s+/);
  const cargoId = input.cargo_nombre?.trim() ? await resolveCargoId(input.cargo_nombre) : null;

  const { error } = await supabase
    .from("trabajadores")
    .update({
      cedula: input.cedula,
      primer_nombre: nombres[0] ?? "",
      segundo_nombre: nombres.slice(1).join(" ") || null,
      primer_apellido: apellidos[0] ?? "",
      segundo_apellido: apellidos.slice(1).join(" ") || null,
      fecha_nacimiento: input.fecha_nacimiento,
      estado_civil: input.estado_civil,
      direccion_habitacion: input.direccion_habitacion,
      salario_base: input.sueldo_base,
      fecha_ingreso: input.fecha_ingreso,
      cargo_id: cargoId,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTrabajador(id: string): Promise<void> {
  const { error } = await supabase.from("trabajadores").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface PayrollWorkerContext {
  trabajadorId: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  cargo: string;
  sueldoMensual: number;
  fechaIngreso: string;
  empresa: {
    nombre: string;
    rif: string;
    direccion: string;
    logoUrl: string | null;
  } | null;
}

export async function getPayrollWorkerContext(trabajadorId: string): Promise<PayrollWorkerContext | null> {
  const { data, error } = await supabase
    .from("trabajadores")
    .select("id, cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, salario_base, fecha_ingreso, empresa_id, cargos(nombre_cargo)")
    .eq("id", trabajadorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  let empresa: PayrollWorkerContext["empresa"] = null;
  if (data.empresa_id) {
    const { data: emp } = await supabase
      .from("empresas")
      .select("nombre, rif, direccion_fiscal, logo_url")
      .eq("id", data.empresa_id)
      .maybeSingle();
    if (emp) {
      empresa = {
        nombre: emp.nombre ?? "",
        rif: emp.rif ?? "",
        direccion: emp.direccion_fiscal ?? "",
        logoUrl: emp.logo_url ?? null,
      };
    }
  }

  const cargo = data.cargos as { nombre_cargo?: string } | null;
  const nombres = [data.primer_nombre, data.segundo_nombre].filter(Boolean).join(" ");
  const apellidos = [data.primer_apellido, data.segundo_apellido].filter(Boolean).join(" ");

  return {
    trabajadorId: data.id,
    nombres,
    apellidos,
    cedula: data.cedula ?? "",
    cargo: cargo?.nombre_cargo ?? "",
    sueldoMensual: Number(data.salario_base) || 0,
    fechaIngreso: data.fecha_ingreso ?? "",
    empresa,
  };
}

export async function listTrabajadoresForPayroll(empresaId: string): Promise<{ id: string; label: string }[]> {
  const { data, error } = await supabase
    .from("trabajadores")
    .select("id, cedula, primer_nombre, primer_apellido")
    .eq("empresa_id", empresaId)
    .order("primer_nombre");
  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({
    id: t.id,
    label: `${t.primer_nombre ?? ""} ${t.primer_apellido ?? ""} (${t.cedula})`.trim(),
  }));
}

export { existsEmpresaRif, existsTrabajadorCedula } from "./duplicateChecks";
