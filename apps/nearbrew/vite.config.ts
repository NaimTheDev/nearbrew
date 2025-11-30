/// <reference types='vitest' />
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export an async function and use dynamic import for ESM-only plugins
// to avoid require() on ESM when transpiled by SWC/ts-node.
export default async ({ mode }: { mode: string }) => {
  const { default: react } = await import('@vitejs/plugin-react');
  const isProduction = mode === 'production';

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/nearbrew',
    base: isProduction ? '/nearbrew/' : '/',
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      },
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    plugins: [react()],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [],
    // },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    test: {
      name: '@nearbrew/nearbrew',
      watch: false,
      globals: true,
      environment: 'jsdom',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: './test-output/vitest/coverage',
        provider: 'v8' as const,
      },
    },
  };
};
