<template>
  <v-app>
    <v-container class="dashboard-container py-10">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="dashboard-card pa-6" elevation="10">
            <!-- Header -->
            <div class="d-flex align-center justify-space-between mb-6">
              <div class="d-flex align-center gap-3">
                <v-avatar size="56" color="primary" class="bordered-avatar">
                  <v-icon size="40" color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h6 mb-0">{{ userName }}</h2>
                  <p class="text-caption text-grey-lighten-1">{{ userEmail }}</p>
                </div>
              </div>

              <v-btn
                color="red-lighten-1"
                variant="tonal"
                @click="logout"
                prepend-icon="mdi-logout"
              >
                Logout
              </v-btn>
            </div>

            <!-- Stats -->
            <v-row dense class="mb-6">
              <v-col cols="6">
                <v-card variant="flat" class="stat-card">
                  <v-icon color="cyan-accent-2" class="mb-1">mdi-star-circle</v-icon>
                  <h3 class="text-h6">{{ profile?.level ?? 1 }}</h3>
                  <p class="text-caption">Level</p>
                </v-card>
              </v-col>

              <v-col cols="6">
                <v-card variant="flat" class="stat-card">
                  <v-icon color="amber-accent-3" class="mb-1">mdi-diamond-stone</v-icon>
                  <h3 class="text-h6">{{ profile?.diamonds ?? 0 }}</h3>
                  <p class="text-caption">Diamonds</p>
                </v-card>
              </v-col>

              <v-col cols="6">
                <v-card variant="flat" class="stat-card">
                  <v-icon color="deep-purple-accent-2" class="mb-1">mdi-heart</v-icon>
                  <h3 class="text-h6">{{ profile?.lives ?? 5 }}</h3>
                  <p class="text-caption">Lives</p>
                </v-card>
              </v-col>

              <v-col cols="6">
                <v-card variant="flat" class="stat-card">
                  <v-icon color="blue-accent-2" class="mb-1">mdi-trophy</v-icon>
                  <h3 class="text-h6">{{ profile?.xp_total ?? 0 }}</h3>
                  <p class="text-caption">XP</p>
                </v-card>
              </v-col>
            </v-row>

            <!-- XP Progress -->
            <div class="mb-6">
              <v-progress-linear
                :model-value="xpProgress"
                color="blue-accent-2"
                height="10"
                rounded
              ></v-progress-linear>
              <div class="d-flex justify-space-between mt-1">
                <span class="text-caption">XP: {{ profile?.xp_total ?? 0 }}</span>
                <span class="text-caption">Next Level: {{ xpToNext }}</span>
              </div>
            </div>

            <!-- Actions -->
            <v-row dense>
              <v-col cols="12" md="4">
                <v-btn
                  class="btn-primary w-100 py-5"
                  prepend-icon="mdi-code-braces"
                  @click="router.push('/playground')"
                >
                  Playground
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn
                  class="btn-primary w-100 py-5"
                  prepend-icon="mdi-sword-cross"
                  @click="router.push('/worlds')"
                >
                  Worlds
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn
                  class="btn-primary w-100 py-5"
                  prepend-icon="mdi-crown"
                  @click="router.push('/leaderboard')"
                >
                  Leaderboard
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from '#app'
import { useAuthUser } from '@/composables/useAuthUser'
import { useGameProgress } from '@/composables/useGameProgress'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const { user, signOut, fetchUser } = useAuthUser()
const { profile, fetchProfile } = useGameProgress()
const supabase = useSupabase()

const userName = computed(() => user.value?.email?.split('@')[0] || 'Player')
const userEmail = computed(() => user.value?.email || 'unknown@email.com')

const xpToNext = computed(() => {
  const level = profile.value?.level ?? 1
  const nextLevelXp = 200 * Math.pow(1.15, level)
  return Math.round(nextLevelXp)
})

const xpProgress = computed(() => {
  const xp = profile.value?.xp_total ?? 0
  const next = xpToNext.value
  const progress = Math.min(100, ((xp % next) / next) * 100)
  return progress
})

const logout = async () => {
  await signOut()
  router.push('/login')
}

onMounted(async () => {
  await fetchUser()
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token
  if (token) {
    await fetchProfile(token)
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #6b21a8, #00e5ff);
}

.dashboard-card {
  background: rgba(17, 15, 40, 0.95);
  color: #fff;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.bordered-avatar {
  border: 2px solid #00e5ff;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  text-align: center;
  padding: 12px 0;
  border-radius: 10px;
}

.btn-primary {
  background: linear-gradient(90deg, #6b21a8, #00e5ff);
  color: #fff;
  font-weight: 600;
  border-radius: 10px;
  text-transform: none;
  transition: 0.2s ease-in-out;
}
.btn-primary:hover {
  filter: brightness(1.1);
}
</style>
