import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  // Relative asset URLs, so a `dist/` build can be opened straight from the
  // filesystem or dropped in a subfolder for a demo — no server config needed.
  base: './',

  server: {
    port: 5173,
    // Fail loudly instead of silently moving to another port, so the URL in
    // the team's notes keeps working.
    strictPort: true,
    // The backend will be a separate service; this keeps local calls to it
    // same-origin and avoids CORS during development.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // The browsers this ships to all support these; a lower target only
    // adds transform output.
    target: 'es2022',
    sourcemap: true,
  },
})
