import axios from 'axios'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.language || !body.code) throw createError({ statusCode: 400, message: 'language and code required' })

  const payload = {
    language: body.language === 'cpp' ? 'cpp' : (body.language === 'java' ? 'java' : 'python'),
    version: '*',
    files: [{ content: body.code }]
  }

  const resp = await axios.post('https://emkc.org/api/v2/piston/execute', payload, { timeout: 20000 })
  return resp.data
})
