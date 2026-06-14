import { supabase } from "@/lib/supabase";

export const EMPRESA_LOGOS_BUCKET = "empresa-logos";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function uploadEmpresaLogo(empresaId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usa PNG, JPG, WEBP o GIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El logo no puede superar 5 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${empresaId}/logo.${ext}`;

  const { error } = await supabase.storage.from(EMPRESA_LOGOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(EMPRESA_LOGOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
