<template>
  <nav class="playground-navbar">
    <div class="nav-left" @click="router.push('/dashboard')">
      <img src="/logo.png" class="logo" />
      <div class="brand-text">
        <h3>Educode</h3>
        <p>Write. Run. Learn. Play.</p>
      </div>
    </div>

    <div class="nav-right">
      <a class="nav-link" @click="router.push('/worlds')">Worlds</a>
      <a class="nav-link active" @click="router.push('/playground')">Playground</a>

      <img
        src="/default-avatar.jpg"
        class="avatar"
        @click="router.push('/dashboard')"
      />
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from '#app'
const router = useRouter()
</script>

<style scoped>
.playground-navbar {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 14px 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 10, 25, 0.85);
  backdrop-filter: blur(12px);
  z-index: 20;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo {
  max-width: 10vw;
  filter: drop-shadow(0 0 8px rgba(0,229,255,0.45));
}

.brand-text h3 {
  margin: 0;
  font-size: 1.3rem;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand-text p {
  margin: 0;
  margin-top: -6px;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.55);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 22px;
}

.nav-link {
  font-size: 1rem;
  color: rgba(255,255,255,0.75);
  cursor: pointer;
  text-decoration: none;
  transition: 0.2s;
}
.nav-link:hover {
  color: #fff;
}
.nav-link.active {
  color: #00e5ff;
  font-weight: 600;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #00e5ff;
  cursor: pointer;
}
</style>
