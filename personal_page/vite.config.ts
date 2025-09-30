import { defineConfig } from 'vite'
// Use type assertion for module imports
// @ts-ignore - Type issues with ESM imports
import vue from '@vitejs/plugin-vue'
// @ts-ignore - Type issues with ESM imports
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    extensions: ['.ts', '.js', '.vue']
  }
})