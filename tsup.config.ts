import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  noExternal: ['@modelcontextprotocol/sdk', 'zod'],
  external: [
    '@google-analytics/admin',
    '@google-analytics/data',
    'googleapis',
    'google-ads-api',
  ],
});
