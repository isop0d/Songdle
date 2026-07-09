import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Deezer's API has no CORS headers, so the dev server proxies it.
      // In production, replicate this with a rewrite (Vercel/Netlify) or a
      // Supabase Edge Function.
      '/api/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ''),
      },
    },
  },
})
