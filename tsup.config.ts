import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['./lib/cli.ts'],
    clean: true,
    format: ['cjs'],
    minify: true,
    dts: false,
    treeshake: true,
    splitting: true,
    outDir: './dist',
  },
]);
