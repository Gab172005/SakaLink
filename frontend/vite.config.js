import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy /api/* → Express backend during development.
      // This avoids CORS issues entirely in dev.
      "/api": {
        target: env.VITE_REACT_APP_BACKEND_BASEURL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});