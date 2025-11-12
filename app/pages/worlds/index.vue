<template>
  <v-app>
    <Navbar />
    <v-container class="container">
      <div class="card">
        <h2>Welcome back, {{username}}</h2>
        <div class="d-flex gap-4">
          <div style="flex:1">
            <h3>Experience (XP)</h3>
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center">
                <div><h1>{{xp_total}}</h1><div>Level {{level}}</div></div>
                <div style="width:45%"><v-progress-linear :value="xp_pct" height="12"/></div>
              </div>
            </div>
          </div>
          <div style="width:320px" class="card">
            <h4>Inventory</h4>
            <div class="d-flex gap-3">
              <div>❤️ {{lives}}</div>
              <div>💡 {{hints}}</div>
              <div>♦ {{diamonds}}</div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px">
          <h3>World Progress</h3>
          <div v-for="w in worlds" :key="w.id" style="margin-bottom:8px">
            <div style="display:flex; justify-content:space-between">
              <div>{{w.name}}</div>
              <div>{{w.progress}} / {{w.total}}</div>
            </div>
            <v-progress-linear :value="(w.progress/w.total)*100" height="8"></v-progress-linear>
          </div>
        </div>

        <div class="d-flex" style="margin-top:20px">
          <v-btn class="btn-primary" @click="$router.push('/worlds')">Select World</v-btn>
          <v-btn class="btn-primary" outlined @click="$router.push('/playground')">Open Playground</v-btn>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
const profile = useState('profile', () => ({ xp_total: 1450, level: 5 }))
const xp_total = ref(profile.value.xp_total)
const level = ref(profile.value.level)
const username = ref('Adventurer')
const xp_pct = computed(() => {
  // for demo: simple mapping
  const next = 2000
  return Math.min(100, Math.round((xp_total.value / next) * 100))
})
const lives = ref(5), hints = ref(3), diamonds = ref(120)
const worlds = ref([
  { id:1, name:'Namespace Necropolis', progress: 6, total: 10 },
  { id:2, name:'Snakebyte Sanctum', progress: 2, total: 10 },
  { id:3, name:'Classpath Crypt', progress: 0, total: 10 }
])
</script>
