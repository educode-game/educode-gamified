// /app/middleware/redirect.global.ts
import { useSupabase } from '~/composables/useSupabase'

export default defineNuxtRouteMiddleware(async (to) => {
  // minimal: only prevent access to private pages if not logged in,
  // and do not force a logged-in user back to dashboard.
  const publicPages = ['/', '/index', '/login', '/signup', '/reset', '/reset-confirm', '/confirm']
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data?.session

  // block private routes
  if (!isLoggedIn && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  // if logged in, allow all pages (do not force dashboard)
  return
})
