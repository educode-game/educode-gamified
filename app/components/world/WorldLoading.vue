<template>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading world…</p>
  </div>
</template>

<style scoped>
.loading { display:flex; flex-direction:column; justify-content:center; align-items:center; height:60vh; }
.spinner {
  width:40px; height:40px;
  border:4px solid #334155;
  border-top-color:#0ea5e9;
  border-radius:50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
</style>
