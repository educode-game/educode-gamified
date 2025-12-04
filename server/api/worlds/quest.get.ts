// server/api/worlds/quest.get.ts
import { getQuery, createError } from "h3"
import { loadQuestFile } from "../../utils/loadQuestFile"

function normalizeWorld(raw: any) {
  let s = String(raw ?? "").toLowerCase().trim()
  s = s.replace(/\s+/g, "-")
  s = s.replace("c++", "cpp")
  s = s.replace("cplusplus", "cpp")
  if (s.endsWith("-adventure")) s = s.replace("-adventure", "")
  return s
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const world_code = normalizeWorld(q.world || q.world_code || "")
  const node = Number(q.node || 0)

  if (!world_code || !node) {
    throw createError({ statusCode: 400, message: "world and node required" })
  }

  const list = loadQuestFile(world_code)
  const quest = list.find((x: any) => Number(x.node) === node)

  if (!quest) {
    throw createError({ statusCode: 404, message: "Quest not found" })
  }

  return {
    questId: quest.questId,
    world: quest.world,
    node: quest.node,
    difficulty: quest.difficulty,
    topic: quest.topic,
    objective: quest.objective,
    example: quest.example,
    starterCode: quest.starterCode,
    testCases: quest.testCases
  }
})
