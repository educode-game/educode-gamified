// /app/utils/clientLevels.ts
// Mirror the XP-level calculations from server/utils/levels.ts

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 200
  const raw = 200 * Math.pow(1.15, level - 1)
  return Math.max(50, Math.round(raw / 50) * 50)
}

export function cumulativeXpForLevel(level: number): number {
  let sum = 0
  for (let l = 1; l < level; l++) {
    sum += xpRequiredForLevel(l)
  }
  return sum
}

export function levelFromTotalXp(totalXp: number) {
  let level = 1
  while (true) {
    const nextCum = cumulativeXpForLevel(level + 1)
    if (totalXp < nextCum) break
    level++
    if (level > 500) break
  }

  const xpIntoLevel = totalXp - cumulativeXpForLevel(level)
  const xpForThisLevel = xpRequiredForLevel(level)

  return {
    level,
    xpIntoLevel,
    xpForThisLevel,
    xpToNextLevel: xpForThisLevel,
    totalXpRequiredForNextLevel: cumulativeXpForLevel(level + 1)
  }
}
