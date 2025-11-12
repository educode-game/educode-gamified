<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>{{ world?.name || 'World' }}</h2>
        <div style="margin-top:12px">
          <!-- Simplified sequential map: nodes in a horizontal line for MVP -->
          <div class="d-flex" style="gap:12px; overflow:auto; padding-bottom:8px;">
            <div v-for="c in challenges" :key="c.id" style="min-width:200px;">
              <v-card :class="{'card--active': !c.user_progress || !c.user_progress.completed}" style="padding:12px">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div><strong>Level {{ c.order_index }}</strong></div>
                  <div style="color:var(--muted)">{{ c.difficulty }}</div>
                </div>
                <div style="margin-top:8px">{{ c.title }}</div>
                <div style="margin-top:12px; display:flex; justify-content:space-between">
                  <v-btn small @click="enter(c)">Play</v-btn>
                  <div>
                    <span v-if="c.user_progress?.completed">⭐{{ c.user_progress.stars }}</span>
                    <span v-else>🔒</span>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'
const route = useRoute()
const id = route.params.id
const world = ref(null)
const challenges = ref([])

onMounted(async () => {
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const { data } = await axios.get(`/api/worlds/${id}/map`, { headers })
  world.value = data.world
  challenges.value = data.challenges || []
})

const enter = (c) => { navigateTo(`/quest/${c.id}`) }
</script>
