import type { Company } from "@/domain/entities";
import type { ICompanyRepository } from "@/domain/repositories";
import { supabase } from "@/lib/supabase";

const TABLE = "empresas";

/** Raw shape of the `empresas` table (Spanish columns). */
interface EmpresaRow {
  id: string;
  nombre?: string | null;
  name?: string | null;
  rif?: string | null;
  email?: string | null;
  telefono?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function toDomain(row: EmpresaRow): Company {
  return {
    id: String(row.id),
    name: row.nombre ?? row.name ?? "Sin nombre",
    taxIdentifier: row.rif ?? "",
    email: row.email ?? "",
    phone: row.telefono ?? "",
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

function toRow(data: Partial<Company>): EmpresaRow {
  const row: EmpresaRow = { id: "" };
  if (data.name !== undefined) row.nombre = data.name;
  if (data.taxIdentifier !== undefined) row.rif = data.taxIdentifier;
  if (data.email !== undefined) row.email = data.email;
  if (data.phone !== undefined) row.telefono = data.phone;
  delete (row as Partial<EmpresaRow>).id;
  return row;
}

export class SupabaseCompanyRepository implements ICompanyRepository {
  async findAll(): Promise<Company[]> {
    const { data, error } = await supabase.from(TABLE).select("*").order("nombre");
    if (error) throw new Error(error.message);
    return (data as EmpresaRow[]).map(toDomain);
  }

  async findById(id: string): Promise<Company | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toDomain(data as EmpresaRow) : null;
  }

  async create(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
    const { data: row, error } = await supabase.from(TABLE).insert(toRow(data)).select("*").single();
    if (error) throw new Error(error.message);
    return toDomain(row as EmpresaRow);
  }

  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    const { data: row, error } = await supabase
      .from(TABLE)
      .update(toRow(data))
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toDomain(row as EmpresaRow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}

export const supabaseCompanyRepository = new SupabaseCompanyRepository();
