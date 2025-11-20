import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Casting process to any to avoid TS error if Node types are missing/incorrect
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is required because the @google/genai SDK uses process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env for other usages if necessary
      'process.env': {},
    },
  };
});