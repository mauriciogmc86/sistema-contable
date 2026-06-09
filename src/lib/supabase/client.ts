import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Browser Supabase client. Uses cookie-based storage (@supabase/ssr) so the
 * session is readable by the Next.js middleware for route protection.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
