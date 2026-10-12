import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Baseline keamanan: bind hanya 127.0.0.1 — LAN (192.168.x.x / 10.x.x.x)tidak bisa akses；
// Port tinggi 26847 menghindari konflik test lokal; strictPort mencegah pindah diam-diam saat port terpakai.
export default defineConfig({
  plugins: [react()],
  server: { port: 26847, host: '127.0.0.1', strictPort: true },
  preview: { port: 26847, host: '127.0.0.1', strictPort: true }
});
