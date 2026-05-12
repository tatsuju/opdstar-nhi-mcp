import { defineConfig } from 'tsup';

export default defineConfig([
  // stdio entry — npx bin
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: true,
    minify: false,
    splitting: false,
    sourcemap: false,
    shims: false,
    banner: { js: '#!/usr/bin/env node' },
  },
  // transport-agnostic dispatcher — consumed by Vercel edge route on opdstar.com
  {
    entry: { 'http-handler': 'src/http-handler.ts' },
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: false,
    minify: false,
    splitting: false,
    sourcemap: false,
    shims: false,
    dts: true,
  },
]);
