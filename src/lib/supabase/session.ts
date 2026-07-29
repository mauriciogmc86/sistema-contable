import { supabase } from "@/lib/supabase";

const AUTH_ERROR_PATTERN =
  /jwt expired|invalid jwt|refresh.?token|session.?not.?found|not authenticated|Auth session missing/i;

export function isAuthExpiredError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" && error && "message" in error
          ? String((error as { message: unknown }).message)
          : "";
  return AUTH_ERROR_PATTERN.test(message);
}

export function authExpiredMessage(): string {
  return "Tu sesión expiró. Vuelve a iniciar sesión para continuar.";
}

/**
 * Refresca el JWT de Supabase antes de operaciones de escritura.
 * Si no hay sesión válida, lanza un error amigable.
 */
export async function ensureFreshSession(): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session) {
      throw new Error(authExpiredMessage());
    }
    return;
  }

  const expiresAt = sessionData.session.expires_at ?? 0;
  const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);

  // Renovar si falta menos de 2 minutos o ya venció.
  if (secondsLeft < 120) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session) {
      throw new Error(authExpiredMessage());
    }
  }
}

export function toUserFacingError(error: unknown, fallback: string): string {
  if (isAuthExpiredError(error)) return authExpiredMessage();
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
