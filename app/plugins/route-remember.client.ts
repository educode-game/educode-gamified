// /app/plugins/route-remember.client.ts
import { useRouter, useRoute } from '#imports'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const route = useRoute()

  function saveCurrentRoute() {
    try {
      const path = String(route.fullPath || route.path || '/')
      const publicPaths = ['/login', '/signup', '/', '/index', '/reset', '/confirm', '/reset-confirm']
      if (!publicPaths.includes(path)) {
        localStorage.setItem('edc_intended_route', path)
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  // Save after every successful navigation
  router.afterEach(() => {
    saveCurrentRoute()
  })

  // Save before unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', saveCurrentRoute)
  }
})
