// /server/utils/badgeSystem.ts

export const computeBadgePoints = (xp: number, threeStar: number, languages: number) => {
  return (xp / 1000) + (threeStar * 10) + (languages * 500)
}

export const getBadgeTier = (points: number) => {
  if (points <= 100) return "🥉 Rookie Coder"
  if (points <= 400) return "🥈 Syntax Explorer"
  if (points <= 800) return "🥇 Logic Master"
  return "🏆 Code Champion"
}
