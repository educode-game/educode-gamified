// server/utils/challengeService.ts
import { supabaseServer } from './supabaseServerClient'

export async function resolveChallengeBySlug(slug: string) {
  if (!slug) throw new Error('slug required')

  const client = supabaseServer
  const { data, error } = await client
    .from('challenges')
    .select('id, slug, xp_base')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return data
}
