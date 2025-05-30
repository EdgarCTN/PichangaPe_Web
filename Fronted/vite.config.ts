import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  return {
    base:
      command === "build"
        ? "/PichangaPe_Web/Fronted/" // base para producción (github pages)
        : "/", // base para desarrollo local
    plugins: [react()],
  };
});
