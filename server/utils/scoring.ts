export function scoreOutput(user: string, expected: string): number {
  if (!user) return 0

  const u = user.trim()
  const e = expected.trim()

  if (u === e) return 3

  if (u.includes(e.substring(0, Math.floor(e.length * 0.8)))) return 2
  if (u.includes(e.substring(0, Math.floor(e.length * 0.6)))) return 1

  return 0
}
