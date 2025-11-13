<template>
  <div class="dashboard-page">
    <!-- Navbar -->
    <nav class="dashboard-navbar">
      <div class="navbar-left" @click="router.push('/landing')">
        <img src="/logo.png" alt="EduCode Logo" class="navbar-logo" />
        <h2>EduCode</h2>
      </div>

      <div class="navbar-right">
        <span class="welcome-text">Welcome, {{ profile?.username }}</span>
        <v-btn class="logout-btn" @click="logout">Sign Out</v-btn>
      </div>
    </nav>

    <!-- Dashboard Content -->
    <div class="dashboard-grid">
      <!-- Profile + XP -->
      <div class="profile-xp-row">
        <div class="dashboard-card profile-info-card">
          <img src="/default-avatar.jpg" alt="Profile" class="avatar" />
          <div>
            <h3>{{ profile?.username }}</h3>
            <p>{{ profile?.email }}</p>
          </div>
        </div>

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

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="dashboard-card stat-card" v-for="stat in stats" :key="stat.label">
          <i :class="stat.icon"></i>
          <div>
            <h4>{{ stat.value }}</h4>
            <p>{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Actions Row -->
      <div class="actions-row">
        <div class="actions-card glow-animate">
          <v-btn class="btn gradient" @click="router.push('/playground')">
            <i class="ri-code-s-slash-line"></i> Playground
          </v-btn>
          <v-btn class="btn gradient" @click="router.push('/worlds')">
            <i class="ri-gamepad-fill"></i> Worlds
          </v-btn>
          <v-btn class="btn gradient" @click="router.push('/leaderboard')">
            <i class="ri-trophy-fill"></i> Leaderboard
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#app'

const router = useRouter()
const profile = ref({
  username: 'Ragnarok',
  email: 'ragnarokclassic41@gmail.com',
  level: 1,
  diamonds: 0,
  lives: 5,
  xp_total: 0
})

const nextLevelXp = 230
const xpPercentage = computed(() => (profile.value.xp_total / nextLevelXp) * 100)

const stats = ref([
  { label: 'Level', value: 1, icon: 'ri-bar-chart-box-fill' },
  { label: 'Diamonds', value: 0, icon: 'ri-gem-fill' },
  { label: 'Lives', value: 5, icon: 'ri-heart-3-fill' },
  { label: 'XP', value: 0, icon: 'ri-flashlight-fill' }
])

const logout = () => {
  // Supabase logout logic (to be added later)
}
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

.logout-btn {
  background: linear-gradient(90deg, #ff4d4d, #ff7575) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 8px;
  text-transform: none;
}

/* === Dashboard Grid === */
.dashboard-grid {
  margin-top: 130px;
  width: 90%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
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

/* === Profile + XP Row === */
.profile-xp-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.profile-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  border: 2px solid #00e5ff;
  padding: 3px;
}

/* XP Progress */
.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.xp-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
  transition: width 0.4s ease;
}

.xp-text {
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 0.9rem;
}

/* === Stats Row === */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 28px;
}

.stat-card i {
  font-size: 2rem;
  color: #00e5ff;
  display: block;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
}

.stat-card h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.stat-card p {
  color: #b5b5b5;
  font-size: 0.95rem;
}

/* Fix for diamond icon */
.ri-gem-fill {
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
}

/* === Actions Row === */
.actions-row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.actions-card {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 1150px;
  background: rgba(10, 10, 25, 0.85);
  border-radius: 20px;
  padding: 32px 50px;
  box-shadow: 0 8px 25px rgba(0, 229, 255, 0.25);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

/* Glow wave animation */
.glow-animate::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(0, 229, 255, 0.2),
    transparent
  );
  animation: glowMove 3s linear infinite;
}

@keyframes glowMove {
  0% {
    left: -50%;
  }
  100% {
    left: 50%;
  }
}

/* Buttons */
.btn {
  flex: 1;
  font-weight: 600 !important;
  border-radius: 10px !important;
  text-transform: none !important;
  padding: 16px 22px;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s ease;
}

.gradient {
  background: linear-gradient(90deg, #9333ea, #00e5ff) !important;
  color: white !important;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.7);
}

/* === Responsive === */
@media (max-width: 1024px) {
  .profile-xp-row {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .actions-card {
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }

  .btn {
    width: 100%;
  }
}
</style>
