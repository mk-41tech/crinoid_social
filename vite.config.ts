import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { approvalApiPlugin } from './server/approvalPlugin.js';

export default defineConfig({
  plugins: [react(), approvalApiPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
