// /app/composables/useSupabase.ts
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabase = (): SupabaseClient => {
  const nuxt = useNuxtApp()
  return nuxt.$supabase as SupabaseClient
}
