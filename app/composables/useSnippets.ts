// /app/composables/useSnippets.ts
import axios from 'axios'

export const useSnippets = () => {
  const save = async (
    title: string,
    language: string,
    code: string,
    token?: string
  ) => {
    return axios.post(
      '/api/snippets/save',
      { title, language, code },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
  }

  const list = async (token?: string) => {
    return axios.get('/api/snippets/list', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
  }

  return { save, list }
}
