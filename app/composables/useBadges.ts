// app/composables/useBadges.ts
import { ref } from 'vue'
import { useApi } from './useApi'

export const useBadges = () => {
  const { apiFetch } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const compute = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch('/api/badges/compute')
      return res
    } catch (e: any) {
      error.value = e?.message || 'Failed to compute badges'
      return null
    } finally {
      loading.value = false
    }
  }

  return { compute, loading, error }
}
