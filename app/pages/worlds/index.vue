<template>
  <v-app>
    <Navbar />

    <div class="worlds-page">
      <div class="worlds-card">
        <h2 class="title">Welcome back, {{ profile?.username || 'Adventurer' }}</h2>

        <!-- XP + Inventory -->
        <div class="top-row">
          <div class="sub-card xp-card">
            <h3>Experience (XP)</h3>
            <div class="xp-stats">
              <div>
                <h1>{{ profile?.xp_total ?? 0 }}</h1>
                <div class="level-text">Level {{ profile?.level ?? 1 }}</div>
              </div>
              <v-progress-linear :value="xpPct" height="12" class="xp-bar" />
            </div>
          </div>

          <div class="sub-card inventory-card">
            <h3>Inventory</h3>
            <div class="inventory-items">
              <div>❤️ {{ profile?.lives ?? 0 }}</div>
              <div>💡 {{ profile?.hints ?? 0 }}</div>
              <div>♦ {{ profile?.diamonds ?? 0 }}</div>
            </div>
          </div>
        </div>

        <h3 class="section-label">World Progress</h3>

        <div v-for="w in displayWorlds" :key="w.id" class="world-row">
          <div class="world-header">
            <span>{{ w.name }}</span>
            <span>{{ w.progress }} / {{ w.total }}</span>
          </div>

          <v-progress-linear :value="(w.progress / w.total) * 100" height="10" class="world-bar" />
        </div>

        <div class="button-row">
          <button class="btn gradient" @click="router.push('/worlds/select')">Select World</button>
          <button class="btn outline" @click="router.push('/playground')">Open Playground</button>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Navbar from "@/components/Navbar.vue";
import { useSupabase } from "@/composables/useSupabase";
import { useRouter } from "#imports";

type World = {
  id: string;
  name: string;
  code_name: string;
  language: string;
  total_nodes: number;
  map_background?: string | null;
};

type WorldsListResponse = { worlds: World[] };

type WorldProgressEntry = { completed_nodes: number[]; unlocked_nodes?: number[] };
type WorldProgressResponse = { progress: Record<string, WorldProgressEntry> };

type ProfileType = { username: string; xp_total: number; level: number; lives: number; hints: number; diamonds: number };

const router = useRouter();
const supabase = useSupabase();

const profile = ref<ProfileType | null>(null);

const xpPct = computed(() => {
  const xp = profile.value?.xp_total ?? 0;
  return Math.min(100, Math.round((xp / 2000) * 100));
});

const loadProfile = async () => {
  const session = (await supabase.auth.getSession())?.data?.session;
  if (!session) return;
  const res = await $fetch<{ profile: ProfileType }>("/api/auth/profile", { headers: { Authorization: `Bearer ${session.access_token}` } });
  profile.value = res.profile;
};

const worlds = ref<World[]>([]);
const progress = ref<Record<string, WorldProgressEntry>>({});

const loadWorlds = async () => {
  const res = await $fetch<WorldsListResponse>("/api/worlds/list");
  worlds.value = res.worlds ?? [];
};

const loadProgress = async () => {
  const res = await $fetch<WorldProgressResponse>("/api/worlds/progress");
  progress.value = res.progress ?? {};
};

const displayWorlds = computed(() =>
  worlds.value.map((w) => {
    const entry = progress.value[w.code_name];
    return {
      ...w,
      total: w.total_nodes ?? w.total_nodes ?? 0,
      progress: Array.isArray(entry?.completed_nodes) ? entry.completed_nodes.length : 0
    };
  })
);

onMounted(async () => {
  await loadProfile();
  await loadWorlds();
  await loadProgress();
});
</script>

<style scoped>
/* unchanged CSS — keep as your theme */
.worlds-page { min-height:100vh; padding:100px 24px; background: linear-gradient(135deg, #5e17eb, #007aff, #00e5ff); display:flex; justify-content:center; }
.worlds-card { width:100%; max-width:1100px; background: rgba(10,10,25,0.85); border-radius:20px; padding:25px; color:white; box-shadow:0 10px 30px rgba(0,0,0,0.35); }
.title { margin-bottom:20px; }
.top-row { display:flex; gap:24px; }
.sub-card { flex:1; background: rgba(255,255,255,0.05); padding:20px; border-radius:16px; }
.inventory-items { display:flex; gap:20px; margin-top:10px; font-size:1.1rem; }
.section-label { margin-top:28px; margin-bottom:10px; }
.world-row { margin-bottom:14px; }
.world-header { display:flex; justify-content:space-between; margin-bottom:4px; }
.button-row { margin-top:20px; display:flex; gap:14px; }
.btn { padding:12px 26px; font-weight:600; border-radius:10px; cursor:pointer; }
.gradient { background: linear-gradient(90deg,#9333ea,#00e5ff); color:white; border:none; }
.outline { border:2px solid #00e5ff; color:#00e5ff; background:transparent; }
</style>
