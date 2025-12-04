// app/composables/useShop.ts
import { ref } from 'vue'
import { useApi } from './useApi'

export const useShop = () => {
  const { apiFetch } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const buyHint = async (price = 5) => {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch('/api/shop/buy-hint', {
        method: 'POST',
        body: { price }
      })
      return res
    } catch (e: any) {
      error.value = e?.message || 'Purchase failed'
      return { ok: false, error }
    } finally {
      loading.value = false
    }
  }

  return { buyHint, loading, error }
}
