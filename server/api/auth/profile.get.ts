import { getUserFromEvent, supabaseServer } from '../../utils/supabaseServerClient'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) return { profile: null }

  const { data } = await supabaseServer
    .from('profiles')
    .select('id,username,xp_total,xp_weekly,level,lives,hints,diamonds,email')
    .eq('id', user.id)
    .single()

  return { profile: data }
})
