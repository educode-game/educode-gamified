<template>
  <div class="worlds-page" :style="{ backgroundImage: 'url(/worlds-bg.png)' }">

    <div class="selector-wrapper">

      <h1 class="title">Select Your World</h1>

      <div class="world-list">

        <!-- WORLD 1 -->
        <div class="world-card">
          <img src="/Dungeon-NameSpace.png" class="world-img" />
          <button class="play-btn" @click="go('namespace-necropolis')">
            <img src="/buttonPlay.png" class="play-img" />
          </button>
        </div>

        <!-- WORLD 2 -->
        <div class="world-card">
          <img src="/Dungeon-SnakeSanctum.png" class="world-img" />
          <button class="play-btn" @click="go('snakebyte-sanctum')">
            <img src="/buttonPlay.png" class="play-img" />
          </button>
        </div>

        <!-- WORLD 3 -->
        <div class="world-card">
          <img src="/Dungeon-ClasspathCrypt.png" class="world-img" />
          <button class="play-btn" @click="go('classpath-crypt')">
            <img src="/buttonPlay.png" class="play-img" />
          </button>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const go = (slug: string) => {
  router.push(`/worlds/${slug}`)
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
  padding-top: 80px;
}

.selector-wrapper {
  text-align: center;
  color: white;
}

.title {
  font-size: 40px;
  margin-bottom: 50px;
}

.world-list {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.world-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.world-img {
  width: 280px;
}

.play-btn {
  margin-top: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.play-img {
  width: 140px;
}

h3 {
  color: #fff;
  margin-top: 10px;
}
</style>
