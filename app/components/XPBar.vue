<template>
  <div class="xp-card">
    <div class="xp-header">
      <span class="level">Lv {{ displayLevel }}</span>
      <span class="xp-text">{{ displayXp }} / {{ xpForLevel }} XP</span>
    </div>

    <div class="bar-outer">
      <div class="bar-fill" :style="{ width: fillPct + '%' }"></div>
    </div>

    <transition name="fade">
      <div v-if="showLevelUp" class="lvlup-badge">LEVEL UP!</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameProgress } from '~/composables/useGameProgress'
import { levelFromTotalXp } from '../utils/clientLevels'

const emit = defineEmits(['level-up'])
const { profile } = useGameProgress()

// XP value used for animation
const animatedTotalXp = ref(0)
const showLevelUp = ref(false)

// Watch for XP changes from backend profile
watch(
  () => profile.value?.xp_total,
  (newXp, oldXp) => {
    if (newXp == null) return

    // first load → no animation
    if (oldXp == null) {
      animatedTotalXp.value = newXp
      return
    }

    animateXp(oldXp, newXp)
  },
  { immediate: true }
)

function animateXp(start: number, end: number) {
  const steps = 30
  const diff = end - start
  const step = diff / steps

  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const current = start + step * i
      animatedTotalXp.value = current

      const before = levelFromTotalXp(start).level
      const after = levelFromTotalXp(current).level

      if (after > before) {
        showLevelUp.value = true
        emit('level-up', after)
        setTimeout(() => (showLevelUp.value = false), 1500)
      }
    }, i * 20)
  }
}

const current = computed(() => levelFromTotalXp(animatedTotalXp.value))

const displayLevel = computed(() => current.value.level)
const displayXp = computed(() => Math.floor(current.value.xpIntoLevel))
const xpForLevel = computed(() => current.value.xpForThisLevel)
const fillPct = computed(() => (displayXp.value / xpForLevel.value) * 100)

defineExpose({
  refresh() {
    animatedTotalXp.value = profile.value?.xp_total ?? 0
  }
})
</script>

<style scoped>
.xp-card {
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 12px;
}
.xp-header {
  display:flex;
  justify-content:space-between;
  margin-bottom:6px;
  color:#d9e3ff;
  font-weight:700;
}
.bar-outer {
  height: 14px;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  height:100%;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  width:0%;
  transition: width .25s linear;
}
.lvlup-badge {
  margin-top:8px;
  background: linear-gradient(90deg,#22c55e,#0ea5e9);
  padding:6px 10px;
  border-radius:999px;
  color:white;
  font-weight:900;
  text-align:center;
}
.fade-enter-active,.fade-leave-active {
  transition: opacity .4s;
}
.fade-enter-from,.fade-leave-to {
  opacity: 0;
}
</style>
