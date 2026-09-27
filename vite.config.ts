import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: process.env.DEV_SERVER_HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
  preview: {
    host: process.env.DEV_SERVER_HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
})
