<template>
  <div class="auth-page">
    <main class="auth-main">
      <div class="card">
        <section class="title-block">
          <img src="/logo.png" alt="EduCode" class="logo" @click="goLanding" />
          <h2 class="headline">
            <span class="grad-static">Create your</span>
            <span class="muted">EduCode Account</span>
          </h2>
          <p class="sub">Choose a username you love — you'll use it to sign in or use email.</p>
        </section>

        <form class="form" @submit.prevent="handleSignup">
          <!-- USERNAME -->
          <div class="field">
            <label class="label">Username</label>
            <div class="input-wrap">
              <span class="icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="1.4"/>
                </svg>
              </span>
              <input
                v-model="username"
                type="text"
                placeholder="pick-a-username"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <!-- EMAIL -->
          <div class="field">
            <label class="label">Email</label>
            <div class="input-wrap">
              <span class="icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 8l9 6 9-6" stroke="currentColor" stroke-width="1.4"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/>
                </svg>
              </span>
              <input
                v-model="email"
                type="email"
                placeholder="you@domain.com"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <!-- PASSWORD -->
          <div class="field">
            <label class="label">Password</label>
            <div class="input-wrap">
              <span class="icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.4" />
                  <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" stroke-width="1.4"/>
                </svg>
              </span>
              <input
                v-model="password"
                type="password"
                placeholder="Choose a strong password"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <!-- ERROR / SUCCESS -->
          <div v-if="error" class="error">{{ error }}</div>
          <div v-if="success" class="success">{{ success }}</div>

          <!-- BUTTON -->
          <button class="btn primary" :disabled="loading">
            <span v-if="!loading">Sign Up</span>
            <span v-else>Creating…</span>
          </button>

          <div class="form-footer">
            <a href="/login" class="link">Already have an account? Log in</a>
            <span class="muted small">By signing up you agree to our Terms.</span>
          </div>
        </form>
      </div>
    </main>

    <footer class="auth-footer">
      <small>© {{ new Date().getFullYear() }} EduCode — Where learning becomes a game</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'

const router = useRouter()

/* -----------------------------
   FORM STATE
------------------------------ */
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

/* Navigation */
const goLanding = () => router.push('/index')

/* -----------------------------
   RESPONSE TYPE (fixes errors)
------------------------------ */
interface SignupResponse {
  error?: string
  success?: boolean
  message?: string
}

/* -----------------------------
   SIGNUP HANDLER
------------------------------ */
const handleSignup = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const cleanUsername = username.value.trim().toLowerCase()

    const res = await $fetch<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        password: password.value,
        username: cleanUsername
      }
    })

    if (res.error) {
      error.value = res.error
      return
    }

    success.value = res.message || 'Signup successful!'

    setTimeout(() => router.push('/login'), 1200)

  } catch (err: any) {
    error.value = err?.message || 'Server error'
  } finally {
    loading.value = false
  }
}

</script>


<style scoped>
/* reuse same base styles as login (Layout B) */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');

.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #5e17eb 0%, #0f6af5 45%, #07d6ff 100%);
  font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #fff;
}

.auth-header { display:flex; align-items:center; gap:14px; padding:20px 36px; }
.logo { max-width:350px; cursor:pointer; }

.auth-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr min(960px, 92%) 1fr;
  align-items: start;
  gap: 20px;
  padding: 28px 0 60px;
}

.title-block { grid-column: 2; text-align: center; margin-bottom: 18px; }
.headline { font-size: 1.9rem; margin: 0; display:flex; justify-content:center; gap:10px; align-items:baseline; }
.headline .grad-static { font-weight:800; font-size:1.9rem; background: linear-gradient(90deg,#9333ea,#00e5ff); background-clip:text; -webkit-text-fill-color:transparent; }
.headline .muted { color: rgba(255,255,255,0.9); font-weight:600; }
.sub { color: rgba(255,255,255,0.8); margin-top:8px; font-size: .95rem; }

.card {
  grid-column: 2;
  margin-top: 8px;
  background: rgba(8,10,20,0.75);
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45), 0 0 80px rgba(0,229,255,0.06) inset;
  border: 1px solid rgba(255,255,255,0.03);
  position: relative;
}
.card::after{ content: ""; position: absolute; inset: -6px; border-radius: 18px; background: linear-gradient(90deg,#9333ea, #00e5ff); opacity: 0.12; filter: blur(14px); z-index:-1; }

.form { display: grid; gap: 14px; max-width: 520px; margin: 0 auto; }
.field { display:flex; flex-direction:column; gap:8px; }
.label { font-size:.85rem; color: rgba(255,255,255,0.75); font-weight:600; }

.input-wrap { display:flex; align-items:center; gap:12px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:10px; padding:10px 12px; border:1px solid rgba(255,255,255,0.06); box-shadow:0 6px 18px rgba(0,0,0,0.45), inset 0 0 18px rgba(0,229,255,0.02); }
.icon { color: #7ff; opacity:0.95; display:inline-flex; align-items:center; justify-content:center; }
.input-wrap input { background: transparent; border: 0; outline: none; color: #fff; font-size:1rem; width:100%; padding:6px 0; }
.input-wrap:focus-within { box-shadow: 0 10px 30px rgba(0,229,255,0.06), inset 0 0 18px rgba(0,229,255,0.03); border-color: rgba(0,229,255,0.22); }

.btn.primary { display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:12px 18px; border-radius:10px; width:100%; background: linear-gradient(90deg,#7b34ff,#00e5ff); color:white; font-weight:700; font-size:1rem; border:none; cursor:pointer; box-shadow:0 8px 30px rgba(0,229,255,0.18); transition: transform .14s ease, box-shadow .14s ease; }
.btn.primary:disabled { opacity:0.7; cursor:not-allowed; }

.error { color:#ff7a7a; background: rgba(255,122,122,0.06); padding:10px; border-radius:8px; font-size:.95rem; border:1px solid rgba(255,122,122,0.08); }
.success { color:#bff3d6; background: rgba(98,255,180,0.03); padding:10px; border-radius:8px; font-size:.95rem; border:1px solid rgba(98,255,180,0.06); }

.form-footer { display:flex; justify-content:space-between; align-items:center; margin-top:6px; }
.link { color:#dbe9ff; text-decoration:none; font-size:.9rem; }
.muted.small { color: rgba(255,255,255,0.55); font-size: 0.8rem; }

/* footer */
.auth-footer { text-align:center; padding: 18px 0; color: rgba(255,255,255,0.6); font-size:.85rem; }

@media (max-width: 720px) {
  .auth-main { grid-template-columns: 1fr; padding: 40px 20px 60px; }
  .title-block { text-align:left; margin-left:6px; }
  .card { padding: 20px; border-radius: 12px; }
  .headline { font-size: 1.5rem; }
  .form { gap: 12px; }
}
</style>
