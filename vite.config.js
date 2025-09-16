import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // You can add global SCSS variables or mixins here if needed
        // additionalData: `@import "./src/styles/_variables.scss";`
      },
    },
  },
})
