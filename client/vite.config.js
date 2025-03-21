import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      "/api": {
        // target: "http://localhost:8080",
        target: "https://task-2-ll3o.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
