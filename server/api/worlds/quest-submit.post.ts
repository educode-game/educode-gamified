import { runCodeInJudge0 } from "../../utils/judge0";
import { langToJudge0, EduCodeWorld } from "../../utils/langMap";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { questId, world, code } = body;

  if (!questId || !world || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const worldKey = world as EduCodeWorld;
  const langId = langToJudge0[worldKey];

  // Load quest
  const questsFile = await import(`../../data/${worldKey}_quests.json`);
  const questList = questsFile.default;
  const quest = questList.find((q: any) => q.questId === questId);

  if (!quest) {
    throw createError({
      statusCode: 404,
      statusMessage: "Quest not found",
    });
  }

  // Run through Judge0
  const result = await runCodeInJudge0(langId, code);

  // Extract outputs
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const compileError = result.compile_output || "";
  const judgeMessage = result.message || "";

  const status = result.status?.description || "Unknown";

  // Combine all errors
  const finalError =
    compileError ||
    stderr ||
    (status !== "Accepted" ? status + ": " + judgeMessage : "");

  return {
    ok: true,
    output: stdout.trim(),
    error: finalError.trim(),
    status,
    raw: result, // optional debug
  };
});
