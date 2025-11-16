<template>
  <transition name="fade">
    <div v-if="show" class="star-container">
      <div class="stars">
        <div
          v-for="n in 3"
          :key="n"
          class="star"
          :class="{ active: n <= currentStars }"
        >
          ★
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  stars: { type: Number, default: 0 }, // stars from backend (0–3)
  show: { type: Boolean, default: false }
})

const currentStars = ref(0)

watch(
  () => props.show,
  (val) => {
    if (val) animateStars()
    else currentStars.value = 0
  }
)

function animateStars() {
  currentStars.value = 0

  // animate stars one by one
  for (let i = 1; i <= props.stars; i++) {
    setTimeout(() => {
      currentStars.value = i
    }, i * 400)
  }
}
</script>

<style scoped>
.star-container {
  display:flex;
  justify-content:center;
  align-items:center;
  margin: 12px 0 16px 0;
}

.stars {
  display:flex;
  gap: 14px;
}

.star {
  font-size: 40px;
  color: rgba(255,255,255,0.25);
  transform: scale(0.6);
  transition: transform 0.3s ease, color 0.3s ease;
}

.star.active {
  color: #ffe066; /* bright gold */
  text-shadow: 0 0 12px rgba(255, 230, 102, 0.6);
  transform: scale(1.2);
}

.fade-enter-active, 
.fade-leave-active {
  transition: opacity .3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
