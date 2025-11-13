<!-- /app/pages/index.vue -->
<template>
  <div class="landing">
    <!-- Static Gradient Background -->
    <div class="gradient-bg"></div>
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>

    <!-- Navbar -->
    <header class="navbar">
      <div class="nav-left">
        <img  src="/logo.png" alt="EduCode Logo" class="logo" />
        <span class="brand">EduCode</span>
      </div>

      <!-- Desktop Nav -->
      <nav class="nav-right">
        <button class="btn-outline" @click="router.push('/login')">Login</button>
        <button class="btn-cta" @click="router.push('/signup')">Sign Up</button>
      </nav>

      <!-- Mobile Hamburger -->
      <div class="hamburger" @click="toggleMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

      <!-- Sidebar Menu -->
      <transition name="slide">
        <div v-if="menuOpen" class="mobile-menu">
          <button class="btn-outline" @click="router.push('/login')">Login</button>
          <button class="btn-cta" @click="router.push('/signup')">Sign Up</button>
        </div>
      </transition>
    </header>

    <!-- Glowing Divider -->
    <div class="navbar-divider"></div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-left">
        <h1>
          <span class="gradient-violet">Learn Coding</span><br />
          Through <span class="highlight">Adventure</span>
        </h1>
        <p>
          Level up your programming skills through interactive quests and coding challenges.
          Master <strong>C++</strong>, <strong>Python</strong>, and
          <strong>Java</strong> while earning XP, diamonds, and badges!
        </p>

        <button class="cta-btn" @click="router.push('/signup')">
          Get Started Now
        </button>
      </div>

      <div class="hero-right">
        <img src="/game.svg" alt="Game Illustration" class="hero-image" />
      </div>
    </section>

    <footer class="footer">
      © {{ new Date().getFullYear() }} <strong>EduCode</strong> — Where Learning Becomes a Game
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
const router = useRouter()
const menuOpen = ref(false)
const toggleMenu = () => (menuOpen.value = !menuOpen.value)
</script>


<style scoped>
/* === Base === */
.landing {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: 'Poppins', sans-serif;
}

/* === Static Gradient Background === */
.gradient-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #5e17eb, #007aff, #00e5ff);
  background-size: cover;
  z-index: 0;
  opacity: 0.9;
}

/* === Floating Orbs === */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  z-index: 1;
}
.orb1 { width: 350px; height: 350px; top: 10%; left: 10%; background: #6c63ff; }
.orb2 { width: 250px; height: 250px; bottom: 15%; right: 10%; background: #00e5ff; }
.orb3 { width: 200px; height: 200px; bottom: 5%; left: 20%; background: #9333ea; }

/* === Navbar === */
.navbar {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 64px;
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(10px);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.6));
}

.brand {
  font-size: 1.8rem;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
}

/* === Navbar Divider === */
.navbar-divider {
  height: 3px;
  background: linear-gradient(90deg, #9333ea, #00e5ff, #9333ea);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.6);
  z-index: 2;
}

/* === Navbar Buttons === */
.nav-right {
  display: flex;
  gap: 20px;
}

/* Outline Gradient Button (Login) */
.btn-outline {
  background: transparent;
  border: 2px solid transparent;
  border-image: linear-gradient(90deg, #9333ea, #00e5ff);
  border-image-slice: 1;
  color: #fff;
  padding: 10px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background: rgba(0, 229, 255, 0.1);
  transform: translateY(-2px);
}

/* CTA Gradient Button (Sign Up + Get Started) */
.btn-cta,
.cta-btn {
  background: linear-gradient(90deg, #9333ea, #00e5ff);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  padding: 14px 36px;
  font-size: 1rem;
  box-shadow: 0 6px 20px rgba(0, 229, 255, 0.5);
  transition: all 0.3s ease;
}
.btn-cta:hover,
.cta-btn:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
  color: #fff;
}

/* === Mobile Hamburger === */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  z-index: 6;
}
.bar {
  width: 26px;
  height: 3px;
  background: #fff;
  border-radius: 3px;
}

/* Mobile Sidebar Menu */
.mobile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background: rgba(15, 15, 35, 0.95);
  border-left: 2px solid rgba(0, 229, 255, 0.2);
  border-bottom: 2px solid rgba(0, 229, 255, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* === Hero Section === */
.hero {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100px 10%;
  flex: 1;
  gap: 80px;
}
.hero-left {
  flex: 1;
  max-width: 620px;
}
.hero-left h1 {
  font-size: 4.8rem;
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1.1;
  margin-bottom: 28px;
}
.gradient-violet {
  background:  #ffffff;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

}
.highlight {
  color: #00e5ff;
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.7);
}
.hero-left p {
  color: #e0e0e0;
  font-size: 1.3rem;
  line-height: 1.7;
  margin-bottom: 48px;
}

/* === Hero Image === */
.hero-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-image {
  width: 110%;
  max-width: 620px;
  filter: drop-shadow(0 0 40px rgba(0, 229, 255, 0.3));
}

/* === Footer === */
.footer {
  text-align: center;
  position: relative;
  z-index: 3;
  padding: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* === Responsive === */
@media (max-width: 1024px) {
  .nav-right { display: none; }
  .hamburger { display: flex; }
  .navbar { padding: 20px 24px; }
  .hero {
    flex-direction: column-reverse;
    text-align: center;
    padding: 60px 8%;
  }
  .hero-right { margin-bottom: 40px; }
  .hero-left h1 { font-size: 3.2rem; }
  .hero-image { max-width: 420px; }
}
</style>
