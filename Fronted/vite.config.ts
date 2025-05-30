import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/PichangaPe_Web/Fronted/',
  plugins: [react()],
});
