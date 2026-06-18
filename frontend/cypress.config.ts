// frontend/cypress.config.ts

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://20.233.249.136:5173', 
    video: true, // IMPORTANT
     // ← Juste pour CI local
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