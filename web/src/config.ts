/* =========================================================
   Runtime configuration.

   `USING_FIXTURES` is deliberately not here: it is resolved in
   vite.config.ts and injected as the `__USING_FIXTURES__` literal, so the
   bundler can drop the fixture branch entirely when it is off. See the
   comment there for the rule.
   ========================================================= */

/** Absolute API origin. Empty means same-origin (dev uses the proxy). */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
