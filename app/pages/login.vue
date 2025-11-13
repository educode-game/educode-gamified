<template>
  <div class="auth-page">
    <main class="auth-main">
      <div class="card">
      <section class="title-block">
              <img src="/logo.png" alt="EduCode" class="logo" @click="goIndex" />
        <h2 class="headline">

          <span class="grad-static">Welcome</span>
          <span class="muted">Back</span>
        </h2>
        <p class="sub">Sign in with your email or username to continue learning through play.</p>
      </section>
        <form class="form" @submit.prevent="handleLogin">
          <div class="field">
            <label class="label">Email or Username</label>
            <div class="input-wrap">
              <span class="icon" aria-hidden>
                <!-- simple SVG user icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 20a8 8 0 0116 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <input
                v-model="identifier"
                type="text"
                placeholder="you@domain or username"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="input-wrap">
              <span class="icon" aria-hidden>
                <!-- lock icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.4" />
                  <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <input
                v-model="password"
                type="password"
                placeholder="Your password"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          <div v-if="error" class="error">{{ error }}</div>

          <button class="btn primary" :disabled="loading">
            <span v-if="!loading">Log In</span>
            <span v-else>Signing in…</span>
          </button>

          <div class="form-footer">
            <a href="/signup" class="link">Don't have an account? Sign up</a>
            <a href="/reset" class="link muted">Forgot password?</a>
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
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const router = useRouter()

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const goIndex = () => router.push('/index')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    let emailToUse = identifier.value.trim()

    // If user typed username (no @) resolve email via server
    if (!emailToUse.includes('@')) {
      const res = await $fetch('/api/auth/resolve-email', {
        method: 'POST',
        body: { username: emailToUse }
      }) as any

      if (res?.error || !res?.email) {
        error.value = 'Invalid username or password.'
        return
      }

      emailToUse = res.email
    }

    // Now perform client-side sign-in so Supabase client session is set
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password.value
    })

    if (signInError) {
      error.value = signInError.message || 'Login failed'
      return
    }

    // success -> fetch user state and route to dashboard
    await supabase.auth.getSession() // ensure the client initializes session
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err?.message || 'Server error'
  } finally {
    loading.value = false
  }
}
</script>



<style scoped>
/* Page background and layout (Layout B) */
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #5e17eb 0%, #0f6af5 45%, #07d6ff 100%);
  font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #fff;
}

/* header */
.auth-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 36px;
}
.logo { max-width: 300px; cursor: pointer; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.25)); }


/* Main */
.auth-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr min(960px, 92%) 1fr;
  align-items: start;
  gap: 20px;
  padding: 28px 0 60px;
}

/* Title block sits center column */
.title-block {
  grid-column: 2;
  text-align: center;
  margin-bottom: 18px;
}
.headline {
  font-size: 2.1rem;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
}
.headline .grad-static {
  font-weight: 800;
  font-size: 2.1rem;
  background: linear-gradient(90deg,#9333ea,#00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.headline .muted { color: rgba(255,255,255,0.87); font-weight: 600; }

.sub {
  color: rgba(255,255,255,0.8);
  margin-top: 8px;
  font-size: .95rem;
}

/* Floating card */
.card {
  grid-column: 2;
  margin-top: 8px;
  background: rgba(8,10,20,0.75);
  border-radius: 14px;
  padding: 28px;
  box-shadow:
    0 12px 40px rgba(0,0,0,0.45),
    0 0 80px rgba(0, 229, 255, 0.06) inset;
  border: 1px solid rgba(255,255,255,0.03);
  position: relative;
  overflow: visible;
}

/* subtle animated gradient border glow (outside the card) */
.card::after{
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 18px;
  background: linear-gradient(90deg,#9333ea, #00e5ff);
  opacity: 0.12;
  filter: blur(14px);
  z-index: -1;
}

/* Form */
.form { display: grid; gap: 14px; max-width: 520px; margin: 0 auto; }
.field { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: .85rem; color: rgba(255,255,255,0.75); font-weight: 600; }

/* Input style A: dark with inner glow */
.input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 6px 18px rgba(0,0,0,0.45), inset 0 0 18px rgba(0,229,255,0.02);
}
.input-wrap .icon { display:inline-flex; align-items:center; justify-content:center; color:#7ff; opacity:0.95; }
.input-wrap input {
  background: transparent;
  border: 0;
  outline: none;
  color: #fff;
  font-size: 1rem;
  width: 100%;
  padding: 6px 0;
}

/* input focus glow */
.input-wrap:focus-within {
  box-shadow: 0 10px 30px rgba(0,229,255,0.06), inset 0 0 18px rgba(0,229,255,0.03);
  border-color: rgba(0,229,255,0.22);
}

/* primary gradient button (style 1) */
.btn.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  width: 100%;
  background: linear-gradient(90deg,#7b34ff,#00e5ff);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(0,229,255,0.18);
  transition: transform .14s ease, box-shadow .14s ease;
}
.btn.primary:active { transform: translateY(1px) }
.btn.primary:disabled { opacity: 0.7; cursor: not-allowed; }

/* error */
.error {
  color: #ff7a7a;
  background: rgba(255,122,122,0.06);
  padding: 10px;
  border-radius: 8px;
  font-size: .95rem;
  border: 1px solid rgba(255,122,122,0.08);
}

/* footer links */
.form-footer {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top: 6px;
}
.link {
  color: #dbe9ff;
  text-decoration: none;
  font-size: .9rem;
}
.link.muted { color: rgba(255,255,255,0.55); }

/* footer */
.auth-footer {
  text-align:center;
  padding: 18px 0;
  color: rgba(255,255,255,0.6);
  font-size: .85rem;
}

/* Responsive: mobile adaptive center layout (requirement #6) */
@media (max-width: 720px) {
  .auth-main { grid-template-columns: 1fr; padding: 40px 20px 60px; }
  .title-block { text-align: left; margin-left: 6px; }
  .card { padding: 20px; border-radius: 12px; }
  .headline { font-size: 1.6rem; }
  .form { gap: 12px; }
}
</style>
