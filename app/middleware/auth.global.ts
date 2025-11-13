// /app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()

  // If user not logged in and tries to open dashboard
  if (!data.session && to.path === '/dashboard') {
    return navigateTo('/index')
  }

  // If user logged in and tries to open public pages
  if (data.session && ['/index', '/', '/login', '/signup'].includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
