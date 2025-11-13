<template>
  <div class="dashboard-page">
    <!-- Navbar -->
    <nav class="dashboard-navbar">
      <div class="navbar-left" @click="router.push('/index')">
        <img src="/logo.png" alt="EduCode Logo" class="navbar-logo" />
        <h2>EduCode</h2>
      </div>

      <div class="navbar-right">
        <span class="welcome-text">Welcome, {{ profile?.username }}</span>
        <v-btn class="logout-btn" @click="logout">Sign Out</v-btn>
      </div>
    </nav>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">

      <!-- Profile + XP Row -->
      <div class="profile-xp-row">

        <!-- Profile Card -->
        <div class="dashboard-card profile-info-card">
          <img src="/default-avatar.jpg" alt="Profile" class="avatar" />
          <div>
            <h3>{{ profile?.username }}</h3>
            <p>{{ profile?.email }}</p>
          </div>
        </div>

        <!-- XP Card -->
        <div class="dashboard-card xp-card">
          <div class="xp-header">
            <h3>Experience Progress</h3>
            <span>Level {{ profile?.level }}</span>
          </div>

          <div class="xp-bar">
            <div class="xp-bar-fill" :style="{ width: xpPercentage + '%' }"></div>
          </div>

          <div class="xp-text">
            <span>XP: {{ profile?.xp_total }}</span>
            <span>Next Level: {{ nextLevelXp }}</span>
          </div>
        </div>

      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="dashboard-card stat-card" v-for="stat in stats" :key="stat.label">
          <i :class="stat.icon" class="stat-icon"></i>
          <div>
            <h4>{{ stat.value }}</h4>
            <p>{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Actions Row -->
      <div class="actions-row">
        <div class="actions-card glow-animate">

          <!-- PLAYGROUND -->
          <div class="playground-card">
            <v-btn class="btn gradient w-100" @click="router.push('/playground')">
              <i class="ri-code-s-slash-line"></i> Playground
            </v-btn>

            <div class="ide-preview">
              <h4>Code Playground</h4>
              <p>Practice C++, Python, and Java instantly.</p>

              <div class="ide-box">
                <pre>// IDE loads here...</pre>
              </div>
            </div>
          </div>

          <!-- WORLDS BUTTON -->
          <v-btn class="btn gradient big-btn" @click="router.push('/worlds')">
            <i class="ri-gamepad-fill"></i> Worlds
          </v-btn>

          <!-- LEADERBOARD BUTTON -->
          <v-btn class="btn gradient big-btn" @click="router.push('/leaderboard')">
            <i class="ri-trophy-fill"></i> Leaderboard
          </v-btn>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import { useSupabase } from "~/composables/useSupabase";
import { useAuthUser } from "~/composables/useAuthUser";

const router = useRouter();
const supabase = useSupabase();
const { fetchUser } = useAuthUser();

/* ------------------------------
   PROFILE RESPONSE TYPE
--------------------------------*/
interface ProfileResponse {
  profile: {
    username: string;
    email: string;
    level: number;
    diamonds: number;
    lives: number;
    xp_total: number;
  } | null;
  user?: any;
}

/* ------------------------------
   STATE
--------------------------------*/
const profile = ref<any>(null);
const sessionToken = ref<string | null>(null);
const nextLevelXp = 230;

/* ------------------------------
   FETCH SESSION TOKEN
--------------------------------*/
const fetchSession = async () => {
  const { data } = await supabase.auth.getSession();
  sessionToken.value = data.session?.access_token || null;
};

/* ------------------------------
   LOAD PROFILE FROM SERVER
--------------------------------*/
const loadProfile = async () => {
  if (!sessionToken.value) return;

  const res = await $fetch<ProfileResponse>("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${sessionToken.value}`,
    },
  });

  profile.value = res.profile;
};

/* ------------------------------
   ON MOUNT
--------------------------------*/
onMounted(async () => {
  await fetchUser();     // ensures user state
  await fetchSession();  // loads access token
  await loadProfile();   // loads profile row
});

/* ------------------------------
   COMPUTED
--------------------------------*/
const xpPercentage = computed(() => {
  if (!profile.value) return 0;
  return (profile.value.xp_total / nextLevelXp) * 100;
});

const stats = computed(() => [
  { label: "Level", value: profile.value?.level, icon: "ri-bar-chart-box-fill" },
  { label: "Diamonds", value: profile.value?.diamonds, icon: "ri-gem-fill" },
  { label: "Lives", value: profile.value?.lives, icon: "ri-heart-3-fill" },
  { label: "XP", value: profile.value?.xp_total, icon: "ri-flashlight-fill" },
]);

/* ------------------------------
   LOGOUT
--------------------------------*/
const logout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

/* === Background === */
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #5e17eb, #007aff, #00e5ff);
  font-family: "Poppins", sans-serif;
  color: white;
  padding-bottom: 60px;
  overflow-x: hidden;
}

/* === Navbar === */
.dashboard-navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 25, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.25);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.navbar-logo {
  width: 48px;
}

.navbar-left h2 {
  font-size: 1.5rem;
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Logout button */
.logout-btn {
  background: linear-gradient(90deg, #ff4d4d, #ff7575) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 8px;
  text-transform: none;
}

/* === Dashboard Layout === */
.dashboard-grid {
  margin-top: 130px;
  width: 90%;
  max-width: 1200px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* === Cards === */
.dashboard-card {
  background: rgba(10, 10, 25, 0.85);
  border-radius: 20px;
  padding: 26px;
  color: white;
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 35px rgba(0, 229, 255, 0.4);
}

/* === Profile + XP === */
.profile-xp-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.avatar {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  border: 2px solid #00e5ff;
}

/* XP */
.xp-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.xp-bar {
  height: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  transition: width 0.4s ease;
}

/* === Stats === */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 26px 0;
}

.stat-icon {
  font-size: 2.4rem;
  margin-bottom: 8px;
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.9);
}

/* === Actions Row === */

.actions-row {
  display: flex;
  justify-content: center;
}

.actions-card {
  width: 100%;
  max-width: 1150px;
  display: flex;
  gap: 26px;
  background: rgba(10, 10, 25, 0.85);
  padding: 35px;
  border-radius: 20px;
  position: relative;
}

/* Playground card FULL WIDTH */
.playground-card {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 20px;
  border-right: 1px solid rgba(255,255,255,0.1);
}

/* Worlds / leaderboard BUTTONS */
.big-btn {
  flex: 1;
}

/* IDE BOX */
.ide-preview h4 {
  font-size: 1.2rem;
  margin-bottom: 6px;
}

.ide-box {
  margin-top: 10px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #cfcfcf;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Buttons */
.btn {
  font-weight: 600 !important;
  border-radius: 10px !important;
  padding: 15px 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.gradient {
  background: linear-gradient(90deg, #9333ea, #00e5ff) !important;
  color: white !important;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}

.btn:hover {
  transform: scale(1.05);
}

/* === Responsive === */
@media (max-width: 970px) {
  .actions-card {
    flex-direction: column;
  }

  .playground-card {
    border-right: none;
    padding-right: 0;
  }
}
</style>
