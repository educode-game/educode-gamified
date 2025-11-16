<template>
  <transition name="fade-scale">
    <div v-if="show" class="overlay">
      <div class="modal">
        <div class="icon">🎉</div>
        <h2>Level Up!</h2>
        <p>You reached <strong>Level {{ level }}</strong></p>

        <button class="btn" @click="close">Continue</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps({
  show: Boolean,
  level: Number
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.modal {
  background: #0b0b14;
  padding: 28px;
  width: 300px;
  border-radius: 14px;
  text-align:center;
  border: 1px solid rgba(255,255,255,0.1);
  animation: pop 0.3s ease-out;
}

.icon { font-size: 48px; margin-bottom: 8px; }

.btn {
  margin-top:18px;
  width:100%;
  padding:10px;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  color:white;
  border:none;
  border-radius:8px;
  font-weight:700;
  cursor:pointer;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all .3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

@keyframes pop {
  0% { transform: scale(0.6); opacity:0; }
  100% { transform: scale(1); opacity:1; }
}
</style>
