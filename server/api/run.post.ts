// server/api/run.post.ts
import axios from 'axios'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { language?: string, code?: string, input?: string }

  if (!body?.language || !body?.code) {
    throw createError({ statusCode: 400, message: 'language and code required' })
  }

  const langMap: Record<string, string> = {
    python: '71',
    cpp: '54',
    java: '62'
  }

  const language_id = langMap[body.language]
  if (!language_id) throw createError({ statusCode: 400, message: 'Unsupported language' })

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    console.error('Judge0 RapidAPI credentials missing')
    throw createError({ statusCode: 500, message: 'Judge runner not configured' })
  }

  try {
    const resp = await axios.post(
      `https://${process.env.RAPIDAPI_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: body.code,
        language_id,
        stdin: body.input ?? ''
      },
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    )

    const result = resp.data || {}
    return {
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      compile_output: result.compile_output ?? '',
      status: result.status ?? null
    }
  } catch (err: any) {
    console.error('Judge0 error:', err?.response?.data || err)
    throw createError({ statusCode: 500, message: 'Judge0 execution failed' })
  }
})
