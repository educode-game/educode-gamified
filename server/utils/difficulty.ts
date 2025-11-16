export function getDifficultyMultiplier(node: number) {
  if (node <= 3) return 1.0
  if (node <= 9) return 1.5
  return 2.0
}
