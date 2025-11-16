export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 200
  const raw = 200 * Math.pow(1.15, level - 1)
  return Math.round(raw / 50) * 50
}

export function cumulativeXp(level: number): number {
  let sum = 0
  for (let i = 1; i < level; i++) {
    sum += xpRequiredForLevel(i)
  }
  return sum
}

export function levelFromTotalXp(totalXp: number) {
  let level = 1

  while (true) {
    const nextLevelTotal = cumulativeXp(level + 1)
    if (totalXp < nextLevelTotal) break
    level++
  }

  const xpIntoLevel = totalXp - cumulativeXp(level)
  const xpForThisLevel = xpRequiredForLevel(level)

  return {
    level,
    xpIntoLevel,
    xpForThisLevel
  }
}
