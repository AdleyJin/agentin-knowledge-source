import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// Standalone Vite app for the Agentin Design System site. It re-uses the
// main project's `node_modules` (running from the repo root via the
// `dev:ds` / `build:ds` scripts), and aliases `@app` to the main app's
// `src/` so every component preview renders the *real* component — no
// duplicated copies that can drift out of sync.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      // `@` mirrors the host project (../src) so every component we
      // re-import (which itself uses `@/lib/utils`, `@/lib/motion`, …)
      // resolves the same paths it does in production. Keep this in
      // sync with the host's vite.config.ts.
      '@': path.resolve(__dirname, '../src'),
      // `@app` is an explicit alias for the same place — used in the
      // DS code so it's visually obvious we're reaching into the host.
      '@app': path.resolve(__dirname, '../src'),
      // DS-local files live under design-system/src and are imported
      // via `@ds/*` to avoid collision with the host's `@`.
      '@ds': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
})
