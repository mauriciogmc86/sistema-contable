import { createClient } from "./supabase/client";

/**
 * Shared browser Supabase client (singleton).
 * Credentials come from env vars — never hardcode them.
 */
export const supabase = createClient();
