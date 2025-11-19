// server/utils/loadQuestFile.ts
import fs from 'fs'
import path from 'path'

export function loadQuestFile(world: string) {
  const map: Record<string, string> = {
    cpp: 'cpp_quests.json',
    java: 'java_quests.json',
    python: 'python_quests.json'
  }

  const filename = map[world]
  if (!filename) throw new Error('Unknown world: ' + world)

  const dataPath = path.join(process.cwd(), 'server', 'data', filename)
  if (!fs.existsSync(dataPath)) throw new Error('Quest data file not found: ' + dataPath)

  const raw = fs.readFileSync(dataPath, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Quest JSON must be an array')
    return parsed
  } catch (err) {
    throw new Error('Failed to parse quest JSON: ' + (err as any).message)
  }
}
