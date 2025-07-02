import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: 'main.js',
      },
      {
        entry: 'public/preload.ts',
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
})