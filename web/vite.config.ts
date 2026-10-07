import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Whether the app runs on development fixtures instead of an API.
 *
 * Resolved here, at build time, and injected as a literal (see `define`
 * below). Two reasons it is not read from `import.meta.env` inside the app:
 *
 *  - The fixtures are reached through a dynamic import, and a value read
 *    inside a module cannot be folded across a function call, so the bundler
 *    would ship the fixture chunk even when they are switched off. A literal
 *    lets it drop the whole branch.
 *  - The rule is a deployment decision, so it belongs next to the other build
 *    settings rather than scattered through the source.
 *
 * The rule: fixtures are ON unless there is a reason for them to be off.
 *
 *   VITE_API_BASE_URL set       -> there is an API; talk to it
 *   VITE_USE_MOCK_API=false     -> explicitly off
 *   VITE_USE_MOCK_API=true      -> explicitly on
 *   nothing set                 -> on
 *
 * The last case matters: a deployment with no configuration is a demo, and a
 * demo with no campaigns shows an empty grid with no way to reach the
 * donation flow at all.
 */
function resolveFixtures(
  flag: string | undefined,
  apiBaseUrl: string,
): boolean {
  if (flag === 'true') return true
  if (flag === 'false') return false
  return apiBaseUrl === ''
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), 'VITE_')
  // Shell and host variables win over .env files, so a Vercel environment
  // variable behaves the same as one set on the command line.
  const read = (key: string): string | undefined =>
    process.env[key] ?? fileEnv[key]

  const apiBaseUrl = read('VITE_API_BASE_URL') ?? ''
  const usingFixtures = resolveFixtures(read('VITE_USE_MOCK_API'), apiBaseUrl)

  return {
    plugins: [react()],

    // Relative asset URLs, so a `dist/` build can be opened straight from the
    // filesystem or dropped in a subfolder for a demo — no server config needed.
    base: './',

    define: {
      __USING_FIXTURES__: JSON.stringify(usingFixtures),
    },

    server: {
      port: 5173,
      // Fail loudly instead of silently moving to another port, so the URL in
      // the team's notes keeps working.
      strictPort: true,
      // Dev-only. A static deployment has no proxy, so the API must be
      // reachable cross-origin or routed by the host.
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
  }
})
