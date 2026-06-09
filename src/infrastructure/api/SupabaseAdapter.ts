/**
 * Supabase Repository Adapters
 *
 * When Supabase is configured, replace Mock*Repository
 * with these Supabase-backed implementations.
 *
 * Example with Supabase client:
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 */

// export class SupabaseCompanyRepository implements ICompanyRepository {
//   async findAll() {
//     const { data } = await supabase.from('companies').select('*')
//     return data ?? []
//   }
//   async findById(id: string) {
//     const { data } = await supabase.from('companies').select('*').eq('id', id).single()
//     return data ?? null
//   }
//   async create(data) {
//     const { data } = await supabase.from('companies').insert(data).select().single()
//     return data
//   }
//   async update(id, data) {
//     const { data } = await supabase.from('companies').update(data).eq('id', id).select().single()
//     return data ?? null
//   }
//   async delete(id) {
//     const { error } = await supabase.from('companies').delete().eq('id', id)
//     return !error
//   }
// }

export {};
