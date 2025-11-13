// /app/middleware/redirect.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()

  // If not logged in and trying to access root -> keep index
  if (!data.session && (to.path === '/' || to.path === '/index')) {
    return // allow /index
  }

  // If logged in and trying to access public pages, go to dashboard
  if (data.session && ['/index', '/', '/login', '/signup'].includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
