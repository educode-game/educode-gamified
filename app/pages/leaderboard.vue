<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>Leaderboard</h2>
        <div v-if="loading">Loading…</div>
        <div v-else>
          <table class="leaderboard-table">
            <thead><tr><th>#</th><th>Player</th><th>Level</th><th>XP</th></tr></thead>
            <tbody>
              <tr v-for="(p, i) in players" :key="p.id">
                <td>{{ i + 1 }}</td>
                <td>{{ p.username }}</td>
                <td>{{ p.level }}</td>
                <td>{{ p.xp_total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '~/components/Navbar.vue'
import { useSupabase } from '~/composables/useSupabase'

const players = ref<any[]>([])
const loading = ref(true)
const supabase = useSupabase()

onMounted(async () => {
  try {
    // fetch leaderboard from API if exists; otherwise query supabase directly
    try {
      const res = await $fetch<{ players: any[] }>('/api/leaderboard/list')
      players.value = res.players ?? []
    } catch {
      // fallback: query profiles (public)
      const { data } = await supabase.from('profiles').select('id, username, level, xp_total').order('xp_total', { ascending: false }).limit(50)
      players.value = (data ?? []) as any[]
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.leaderboard-table { width:100%; border-collapse: collapse; margin-top:12px; }
.leaderboard-table th, .leaderboard-table td { padding:8px 10px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.04); }
</style>
