import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

const coiHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
}

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
    headers: coiHeaders,
  },
  preview: {
    host: process.env.DEV_SERVER_HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
    headers: coiHeaders,
  },
})
