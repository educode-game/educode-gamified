<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>Your Profile</h2>

        <div v-if="loading">Loading…</div>

        <div v-else>
          <div class="profile-grid">
            <div>
              <img src="/default-avatar.jpg" class="avatar" />
            </div>
            <div>
              <h3>{{ profile?.username }}</h3>
              <p>{{ profile?.email }}</p>
              <p>Level: {{ profile?.level }} • XP: {{ profile?.xp_total }}</p>

              <div style="margin-top:10px;">
                <button @click="refresh">Refresh</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '~/components/Navbar.vue'
import { useAuthUser } from '~/composables/useAuthUser'

const { profile, fetchProfile } = useAuthUser()
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await fetchProfile()
  } finally {
    loading.value = false
  }
})

const refresh = async () => {
  loading.value = true
  try {
    await fetchProfile()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-grid { display:flex; gap:20px; align-items:center; }
.avatar { width:96px; height:96px; border-radius:50%; border:2px solid #00e5ff; }
</style>
