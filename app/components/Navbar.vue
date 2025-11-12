<template>
  <v-app-bar flat dense color="transparent">
    <v-container class="d-flex align-center">
      <div @click="goHome" style="cursor:pointer; display:flex; align-items:center; gap:10px;">
        <div style="width:44px; height:44px; border-radius:8px; background: linear-gradient(135deg,#6b21a8,#00e5ff); display:flex; align-items:center; justify-content:center">
          <v-icon>mdi-console</v-icon>
        </div>
        <div>
          <div style="font-weight:800; font-size:18px;">Educode</div>
          <div style="font-size:12px; color:var(--muted)">Write. Run. Learn. Play.</div>
        </div>
      </div>

      <v-spacer />
      <div class="d-flex align-center gap-4">
        <div class="stat" v-if="profile">
          <v-icon small>mdi-heart</v-icon> <span style="margin-left:6px">{{ profile.lives }}</span>
        </div>
        <div class="stat" v-if="profile">
          <v-icon small>mdi-diamond</v-icon> <span style="margin-left:6px">{{ profile.diamonds }}</span>
        </div>

        <v-btn variant="text" @click="$router.push('/worlds')">Worlds</v-btn>
        <v-btn class="btn-primary" @click="$router.push('/playground')">Playground</v-btn>

        <v-avatar v-if="user">
          <img :src="user?.user_metadata?.avatar_url || '/avatar.png'" />
        </v-avatar>
        <v-btn v-else text @click="$router.push('/login')">Login</v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthUser } from '@/composables/useAuthUser'
import { useGameProgress } from '@/composables/useGameProgress'

const { user, fetchUser } = useAuthUser()
const { profile, fetchProfile } = useGameProgress()

onMounted(async () => {
  await fetchUser()
  const token = (await useSupabase().auth.getSession())?.data?.session?.access_token
  if (token) await fetchProfile(token)
})

const goHome = () => { navigateTo('/') }
</script>

<style scoped>
.stat { display:flex; align-items:center; gap:6px; color:#e6e6ff; }
</style>
