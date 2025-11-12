export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()

  // If user not logged in and tries to open dashboard
  if (!data.session && to.path === '/dashboard') {
    return navigateTo('/landing')
  }

  // If user logged in and tries to open public pages
  if (data.session && ['/landing', '/login', '/signup'].includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
