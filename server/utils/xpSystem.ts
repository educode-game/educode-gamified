// /server/utils/xpSystem.ts

// 📌 Base XP by level ranges
export const XP_LEVEL_TABLE: { [key: number]: number } = {
  1: 100,
  2: 100,
  3: 100,
  4: 100,
  5: 100,

  6: 150,
  7: 150,
  8: 150,
  9: 150,
  10: 150,

  11: 200,
  12: 200,
  13: 200,
  14: 200,
  15: 200,

  16: 300,
  17: 300,
  18: 300,
  19: 300,
  20: 300,

  21: 400,
  22: 400,
  23: 400,
  24: 400,
  25: 400,

  26: 500,
  27: 500,
  28: 500,
  29: 500,
  30: 500,

  31: 650,
  32: 650,
  33: 650,
  34: 650,
  35: 650,

  36: 800,
  37: 800,
  38: 800,
  39: 800,
  40: 800,

  41: 1000,
  42: 1000,
  43: 1000,
  44: 1000,
  45: 1000,

  46: 1200,
  47: 1200,
  48: 1200,
  49: 1200,
  50: 1200
}

// ⭐ Stars multipliers
export const STAR_MULTIPLIER: Record<0 | 1 | 2 | 3, number> = {
  3: 1.00,
  2: 0.80,
  1: 0.60,
  0: 0.00
}

/**
 * Calculate XP earned for completing a challenge.
 */
export function calculateXPEarned(level: number, stars: 0 | 1 | 2 | 3): number {
  const baseXP = XP_LEVEL_TABLE[level] || 100
  const multiplier = STAR_MULTIPLIER[stars] ?? 0
  return Math.round(baseXP * multiplier)
}

/**
 * Check if player should level up.
 * Level-up rule:
 *    Every 1000 XP = level up
 *    (You can adjust this rule later)
 */
export function checkLevelUp(totalXP: number, currentLevel: number): boolean {
  const requiredXP = (currentLevel + 1) * 1000
  return totalXP >= requiredXP
}
