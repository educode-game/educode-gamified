// /app/composables/useRunner.ts
import axios from 'axios'
import { ref } from 'vue'

export const useRunner = () => {
  const output = ref<string>('')
  const running = ref(false)
  const error = ref<string | null>(null)

  const run = async (language: string, code: string): Promise<void> => {
    running.value = true
    output.value = ''
    error.value = null
    try {
      const { data } = await axios.post('/api/run', { language, code })
      output.value = data?.run?.output ?? data?.output ?? JSON.stringify(data)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      running.value = false
    }
  }

  return { output, run, running, error }
}
