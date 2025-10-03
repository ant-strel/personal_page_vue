import { defineConfig } from 'vite'
// Use type assertion for module imports
// @ts-ignore - Type issues with ESM imports
import vue from '@vitejs/plugin-vue'
// @ts-ignore - Type issues with ESM imports
import vueJsx from '@vitejs/plugin-vue-jsx'

import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.ts', '.js', '.vue']
  }
})