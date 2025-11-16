import { runCodeInJudge0 } from "../../utils/judge0";
import { langToJudge0, EduCodeWorld } from "../../utils/langMap";
import { getDifficultyMultiplier } from "../../utils/difficulty";
import { scoreOutput } from "../../utils/scoring";

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
    throw createError({ statusCode: 404, statusMessage: "Quest not found" });
  }

  // Run code via Judge0
  const result = await runCodeInJudge0(langId, code);

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const compileError = result.compile_output || "";
  const status = result.status?.description || "";

  const hasError = compileError || stderr || status !== "Accepted";

  let stars = 0;
  let xp = 0;

  if (!hasError) {
    // Score output
    stars = scoreOutput(stdout, quest.example.output);

    // Compute XP
    const multiplier = getDifficultyMultiplier(quest.node);
    const baseXP = 50;

    xp = Math.floor(baseXP * multiplier * stars);
  }

  return {
    ok: true,
    output: stdout.trim(),
    error: (compileError || stderr)?.trim() || "",
    status,

    // NEW
    stars,
    xp,

    raw: result // optional for debugging
  };
});
