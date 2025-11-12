export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()

  // 🚀 If not logged in and trying to access root or dashboard, go to landing
  if (!data.session && (to.path === '/' || to.path === '/index')) {
    return navigateTo('/landing')
  }

  // 🚀 If logged in and trying to access public pages, go to dashboard
  if (data.session && ['/landing', '/login', '/signup'].includes(to.path)) {
    return navigateTo('/')
  }
})
