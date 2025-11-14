// /server/utils/xpSystem.ts

/** 
 * BASE XP by level ranges
 */
export const baseXPByLevel = [
  { min: 1, max: 5, xp: 100 },
  { min: 6, max: 10, xp: 150 },
  { min: 11, max: 15, xp: 200 },
  { min: 16, max: 20, xp: 300 },
  { min: 21, max: 25, xp: 400 },
  { min: 26, max: 30, xp: 500 },
  { min: 31, max: 35, xp: 650 },
  { min: 36, max: 40, xp: 800 },
  { min: 41, max: 45, xp: 1000 },
  { min: 46, max: 50, xp: 1200 }
]

export function getBaseXP(level: number): number {
  for (const row of baseXPByLevel) {
    if (level >= row.min && level <= row.max) return row.xp
  }
  return 100
}

/**
 * Performance multipliers
 */
export const performanceMultiplier: Record<number, number> = {
  3: 1.0,
  2: 0.8,
  1: 0.6,
  0: 0.0
}

/**
 * XP Required using smooth exponential curve:
 * XP_n = 200 × (1.15)^(n-1)
 */
export function getXPRequiredForLevel(level: number): number {
  const raw = 200 * Math.pow(1.15, level - 1)
  return Math.round(raw / 50) * 50
}

/**
 * FINAL XP CALCULATION
 */
export function calculateChallengeXP(level: number, stars: number): number {
  const base = getBaseXP(level)
  const multiplier = performanceMultiplier[stars] ?? 0
  return Math.floor(base * multiplier)
}
