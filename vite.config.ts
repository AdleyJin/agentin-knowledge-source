import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  // Relative base lets the built index.html load via the file:// protocol
  // (i.e. double-clicking the file in Finder), which the singlefile build
  // is optimized for. It still works behind any static host.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // `import IconFoo from './foo.svg?react'` → React component that
    // honors `currentColor` and accepts `className`/`width`/etc.
    svgr(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Inline every asset (images, fonts, etc.) so the final dist/index.html
    // is fully self-contained — no sibling files needed.
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 100_000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
