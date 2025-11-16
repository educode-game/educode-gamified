// server/utils/levels.ts
export function xpRequiredForLevel(level: number): number {
  // XP_required(n) = 200 × (1.15^(n - 1)), rounded to nearest 50
  if (level <= 1) return 200
  const raw = 200 * Math.pow(1.15, level - 1)
  return Math.max(50, Math.round(raw / 50) * 50)
}

export function cumulativeXpForLevel(level: number): number {
  // total XP required *to reach* `level` (i.e., sum of xpRequiredForLevel for levels 1..(level-1))
  let sum = 0
  for (let l = 1; l < level; l++) {
    sum += xpRequiredForLevel(l)
  }
  return sum
}

export function levelFromTotalXp(totalXp: number) {
  // Find level such that cumulativeXpForLevel(level) <= totalXp < cumulativeXpForLevel(level+1)
  let level = 1
  while (true) {
    const nextCum = cumulativeXpForLevel(level + 1)
    if (totalXp < nextCum) break
    level++
    // safety cap (avoid infinite loop)
    if (level > 500) break
  }
  const xpIntoLevel = totalXp - cumulativeXpForLevel(level)
  const xpForThisLevel = xpRequiredForLevel(level)
  const xpToNextLevel = xpForThisLevel
  return {
    level,
    xpIntoLevel,
    xpToNextLevel,
    xpForThisLevel,
    totalXpRequiredForNextLevel: cumulativeXpForLevel(level + 1)
  }
}
