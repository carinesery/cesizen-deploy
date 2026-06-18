// frontend/cypress.config.ts

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',  // ← Juste pour CI local
    setupNodeEvents(on, config) {
      // Pas besoin de rien ici
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});