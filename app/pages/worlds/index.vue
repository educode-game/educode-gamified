<template>
  <v-app>
    <Navbar />

    <div class="worlds-page">

      <div class="worlds-card">

        <!-- Header -->
        <h2 class="title">Welcome back, {{ profile?.username || 'Adventurer' }}</h2>

        <!-- XP + Inventory -->
        <div class="top-row">

          <!-- XP CARD -->
          <div class="sub-card xp-card">
            <h3>Experience (XP)</h3>

            <div class="xp-stats">
              <div>
                <h1>{{ profile?.xp_total }}</h1>
                <div class="level-text">Level {{ profile?.level }}</div>
              </div>

              <v-progress-linear
                :value="xpPct"
                height="12"
                class="xp-bar"
              />
            </div>
          </div>

          <!-- INVENTORY -->
          <div class="sub-card inventory-card">
            <h3>Inventory</h3>
            <div class="inventory-items">
              <div>❤️ {{ profile?.lives }}</div>
              <div>💡 {{ profile?.hints }}</div>
              <div>♦ {{ profile?.diamonds }}</div>
            </div>
          </div>

        </div>

        <!-- World Progress -->
        <h3 class="section-label">World Progress</h3>

        <div v-for="w in worlds" :key="w.id" class="world-row">
          <div class="world-header">
            <span>{{ w.name }}</span>
            <span>{{ w.progress }} / {{ w.total }}</span>
          </div>
          <v-progress-linear
            :value="(w.progress / w.total) * 100"
            height="10"
            class="world-bar"
          />
        </div>

        <!-- Buttons -->
        <div class="button-row">
          <button class="btn gradient" @click="router.push('/worlds/select')">
            Select World
          </button>
          <button class="btn outline" @click="router.push('/playground')">
            Open Playground
          </button>
        </div>

      </div>

    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useSupabase } from '@/composables/useSupabase'
import { useRouter } from '#app'

const router = useRouter()
const supabase = useSupabase()

interface ProfileResponse {
  profile: {
    username: string
    xp_total: number
    level: number
    lives: number
    hints: number
    diamonds: number
  } | null
}

const profile = ref<ProfileResponse['profile']>(null)

const worlds = ref([
  { id: 1, name: 'Namespace Necropolis', progress: 6, total: 10 },
  { id: 2, name: 'Snakebyte Sanctum', progress: 2, total: 10 },
  { id: 3, name: 'Classpath Crypt', progress: 0, total: 10 }
])

const xpPct = computed(() => {
  if (!profile.value) return 0
  const next = 2000
  return Math.round((profile.value.xp_total / next) * 100)
})

const loadProfile = async () => {
  const session = (await supabase.auth.getSession())?.data?.session
  if (!session) return

  const res = await $fetch<ProfileResponse>('/api/auth/profile', {
    headers: { Authorization: `Bearer ${session.access_token}` }
  })

  profile.value = res.profile
}

onMounted(loadProfile)
</script>

<style scoped>
/* Page background */
.worlds-page {
  min-height: 100vh;
  padding: 100px 24px;
  background: linear-gradient(135deg, #5e17eb, #007aff, #00e5ff);
  display: flex;
  justify-content: center;
}

/* Main card */
.worlds-card {
  width: 100%;
  max-width: 1100px;
  background: rgba(10,10,25,0.85);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(12px);
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}

.title {
  margin-bottom: 20px;
}

/* Top row */
.top-row {
  display: flex;
  gap: 24px;
}

.sub-card {
  flex: 1;
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 16px;
  box-shadow: inset 0 0 12px rgba(0,229,255,0.1);
}

.inventory-card {
  max-width: 280px;
}

.inventory-items {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-size: 1.1rem;
}

.level-text {
  opacity: 0.8;
}

.xp-bar {
  margin-top: 10px;
}

/* World Progress */
.section-label {
  margin-top: 28px;
  margin-bottom: 10px;
}

.world-row {
  margin-bottom: 14px;
}

.world-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.world-bar {
  background: rgba(255,255,255,0.15) !important;
}

/* Buttons */
.button-row {
  margin-top: 20px;
  display: flex;
  gap: 14px;
}

.btn {
  padding: 12px 26px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
}

.gradient {
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  color: white;
  border: none;
}

.outline {
  border: 2px solid #00e5ff;
  color: #00e5ff;
  background: transparent;
}
</style>
