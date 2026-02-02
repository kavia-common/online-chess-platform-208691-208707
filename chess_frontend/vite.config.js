import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for the chess_frontend React app. */
  plugins: [react()],
  server: {
    port: 5173
  }
});
