// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.js'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  }
});
