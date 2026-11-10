import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A API roda em outra porta; `scripts/dev.mjs` informa qual por API_PORT e a interface fala só com /api.
const api = `http://127.0.0.1:${process.env.API_PORT ?? 3001}`;

export default defineConfig({
  root: "client",
  plugins: [react()],
  server: { host: "127.0.0.1", port: Number(process.env.WEB_PORT ?? 5173), strictPort: true, proxy: { "/api": api } },
  build: { outDir: "../dist", emptyOutDir: true },
});
