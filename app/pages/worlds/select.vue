<template>
  <v-app>
    <Navbar />

    <div
      class="worlds-page"
      :style="{ backgroundImage: 'url(/worlds-bg.png)' }"
    >
      <div class="selector-wrapper">

        <h1 class="title">Select Your World</h1>

        <div class="world-list">

          <!-- WORLD 1 -->
          <div class="world-card">
            <img src="/cpp_Adventure_Dungeon.png" class="world-img" alt="C++ World" />
            <button class="play-btn" @click="go('cpp-adventure')">
              <img src="/buttonPlay.png" class="play-img" alt="Play Button" />
            </button>
          </div>

          <!-- WORLD 2 -->
          <div class="world-card">
            <img src="/Python_Adventure_Dungeon.png" class="world-img" alt="Python World" />
            <button class="play-btn" @click="go('python-adventure')">
              <img src="/buttonPlay.png" class="play-img" alt="Play Button" />
            </button>
          </div>

          <!-- WORLD 3 -->
          <div class="world-card">
            <img src="/Java_Adventure_Dungeon.png" class="world-img" alt="Java World" />
            <button class="play-btn" @click="go('java-adventure')">
              <img src="/buttonPlay.png" class="play-img" alt="Play Button" />
            </button>
          </div>

        </div>

      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue"
import { useRouter } from "#imports"

const router = useRouter()

const go = (slug: string) => {
  router.push(`/worlds/${encodeURIComponent(slug)}`)
}
</script>


<style scoped>
.worlds-page {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  padding-top: 140px; /* extra padding for navbar */
}

.selector-wrapper {
  text-align: center;
  color: white;
}

.title {
  font-size: 40px;
  margin-bottom: 50px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.world-list {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.world-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.world-img {
  width: 300px;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.45));
}

.play-btn {
  margin-top: 16px;
  background: none;
  border: none;
  cursor: pointer;
}

.play-img {
  width: 160px;
  transition: transform 0.2s;
}

.play-img:hover {
  transform: scale(1.05);
}
</style>
