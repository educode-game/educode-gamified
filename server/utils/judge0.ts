const JUDGE0_URL =
  "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

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
    const response = await $fetch(JUDGE0_URL, {
      method: "POST",
      body: {
        language_id: languageId,
        source_code: code,
        stdin: input,
        redirect_stderr_to_stdout: false,
      },
    });

    return response as Judge0Result;
  } catch (err) {
    console.error("Judge0 error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Judge0 execution failed",
    });
  }
}
