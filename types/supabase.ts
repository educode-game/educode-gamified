// /types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          xp_total: number | null
          xp_weekly: number | null
          level: number | null
          lives: number | null
          diamonds: number | null
          joined_at: string | null
          last_life_generated_at: string | null
        }
      }
      challenges: {
        Row: {
          id: string
          expected_output: string
          xp_base: number
          difficulty: string
        }
      }
    }
  }
}
