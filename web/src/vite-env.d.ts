/// <reference types="vite/client" />

/**
 * Typed environment variables. Vite only exposes variables prefixed with
 * VITE_, and it inlines them at build time, so read them here rather than
 * reaching for import.meta.env directly in components.
 */
interface ImportMetaEnv {
  /** Absolute API origin. Leave unset to use the dev proxy / same origin. */
  readonly VITE_API_BASE_URL?: string
  /** "true" serves development fixtures instead of calling the backend. */
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
