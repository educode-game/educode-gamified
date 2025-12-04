// app/composables/useQuest.ts
import { ref } from 'vue'
import { useApi } from './useApi'
import { useGameSync } from './useGameSync'

export const useQuest = () => {
  const { apiFetch } = useApi()
  const { syncAll } = useGameSync()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const getQuest = async (world: string, node: number) => {
    loading.value = true
    error.value = null
    try {
      return await apiFetch('/api/worlds/quest', { query: { world, node } })
    } catch (e: any) {
      error.value = e?.message || 'Failed to load quest'
      return null
    } finally {
      loading.value = false
    }
  }

  const submitQuest = async (world_code: string, node_id: number, code: string) => {
    loading.value = true
    try {
      const res = await apiFetch('/api/worlds/quest-submit', {
        method: 'POST',
        body: { world_code, node_id, code }
      })

      if (res?.ok) {
        // 🔥 Sync UI after successful quest completion
        await syncAll()
      }

      return res
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Submission failed' }
    } finally {
      loading.value = false
    }
  }

  return { getQuest, submitQuest, loading, error }
}
