// /app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabase()
  const { data } = await supabase.auth.getSession()

  const isLoggedIn = !!data.session

  const publicPages = ['/index', '/', '/login', '/signup']
  const isPublic = publicPages.includes(to.path)

  // 1) If NOT logged in → block private pages
  if (!isLoggedIn && !isPublic) {
    return navigateTo('/index')
  }

  // 2) If logged in → block public pages
  if (isLoggedIn && isPublic) {
    return navigateTo('/dashboard')
  }
})
