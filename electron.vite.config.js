import {resolve} from 'path'
import {defineConfig, externalizeDepsPlugin} from "electron-vite"
import viteReact from "@vitejs/plugin-react"

// electron.vite.config.js
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [viteReact()]
  }
})
