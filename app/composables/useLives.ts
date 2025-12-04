// app/composables/useLives.ts
import { ref } from 'vue'
import { useApi } from './useApi'

export const useLives = () => {
  const { apiFetch } = useApi()

  // Shared global reactive state (persists between pages)
  const lives = useState<number>('player_lives', () => 5)
  const lastUpdated = useState<string | null>('lives_updated', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch lives from backend
   */
  const fetchLives = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await apiFetch<{ lives: number; lastUpdated: string }>('/api/users/lives')
      lives.value = res?.lives ?? lives.value
      lastUpdated.value = res?.lastUpdated ?? null
      return res
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch lives'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    lives,
    lastUpdated,
    fetchLives,
    loading,
    error
  }
}
