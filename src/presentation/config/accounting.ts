/**
 * The accounting module (accounts, journal entries, reports) currently runs on
 * in-memory mock repositories scoped by company id. This constant points to the
 * seeded demo company until the module is backed by Supabase.
 */
export const ACCOUNTING_COMPANY_ID = "comp-1";
