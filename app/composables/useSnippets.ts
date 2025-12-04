// /app/composables/useSnippets.ts
import { ref } from 'vue'
import { useApi } from './useApi'

export const useSnippets = () => {
  const { apiFetch } = useApi()
  const snippets = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const save = async (title: string, language: string, code: string) => {
    return apiFetch<any>('/api/snippets/save', {
      method: 'POST',
      body: { title, language, code }
    })
  }

  const list = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch<{ snippets: any[] }>('/api/snippets/list')
      snippets.value = Array.isArray(res?.snippets) ? res.snippets : []
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      snippets.value = []
    } finally {
      loading.value = false
    }
  }

  const deleteSnippet = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await apiFetch('/api/snippets/delete', {
        method: 'POST',
        body: { id }
      })
      await list() // refresh list
    } catch (e: any) {
      error.value = e?.message ?? String(e)
    } finally {
      loading.value = false
    }
  }

  return { save, list, deleteSnippet, snippets, loading, error }
}
