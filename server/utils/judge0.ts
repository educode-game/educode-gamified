// server/utils/judge0.ts
/**
 * Judge0 runner via RapidAPI (judge0-ce.p.rapidapi.com)
 * Make sure RAPIDAPI_KEY is set in your environment (.env.local)
 */
// /server/utils/judge0.ts
import { createError } from 'h3'   // ⬅️ add this

// const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

const JUDGE0_URL = " judge0-ce.p.rapidapi.com"; 

export interface Judge0Result {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: {
    id: number;
    description: string;
  };
}

export async function runCodeInJudge0(
  languageId: number,
  code: string,
  input: string = ""
): Promise<Judge0Result> {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      console.error("RAPIDAPI_KEY is not set in environment")
      throw createError({ statusCode: 500, statusMessage: "Judge0 configuration missing" })
    }

    const response = await $fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      body: {
        language_id: languageId,
        source_code: code,
        stdin: input,
        // redirect_stderr_to_stdout: false // Judge0 provider handles fields differently; leave default
      },
      // set a reasonable timeout for the fetch (optional; Nitro has its own)
    })

    return response as Judge0Result
  } catch (err: any) {
    console.error("Judge0 error:", err)
    throw createError({
      statusCode: 500,
      statusMessage: "Judge0 execution failed"
    })
  }
}
