/// <reference types="vite/client" />

/**
 * Whether the development fixtures are standing in for an API.
 *
 * Injected as a literal by `define` in vite.config.ts, where the rule that
 * decides it lives. Declared here so the app can use it with a type.
 */
declare const __USING_FIXTURES__: boolean

/**
 * Typed environment variables. Only the API origin reaches the client code;
 * the fixtures switch is resolved at build time in vite.config.ts.
 */
interface ImportMetaEnv {
  /** Absolute API origin. Leave unset to use the dev proxy / same origin. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
