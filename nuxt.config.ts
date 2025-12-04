// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      title: 'Educode',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Educode — Write. Run. Learn. Play.' }
      ]
    }
  },

  plugins: [
    "~/plugins/monaco.client.ts"
  ],

  vite: {
    optimizeDeps: {
      include: ["monaco-editor"]
    },
    worker: {
      format: "es", // 💯 required for module workers
    },
  },

  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
      RAPIDAPI_HOST: process.env.RAPIDAPI_HOST,
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    }
  },

  css: ['vuetify/styles', '@/assets/styles/main.css'],
  build: { transpile: ['vuetify'] },
  typescript: { strict: true, shim: false }
})
