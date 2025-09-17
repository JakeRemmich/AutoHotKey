import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import removeConsole from "vite-plugin-remove-console";

export default defineConfig({
  plugins: [react(), removeConsole()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },

    },
    allowedHosts: [
      'localhost',
    ],
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/public/**', '**/log/**']
    }
  },
})
