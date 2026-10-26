import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { build } from 'esbuild';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src', 'dist', {
  recursive: true,
  filter: source => !source.includes('/components') && !source.endsWith('gradient-entry.jsx'),
});

await build({
  entryPoints: ['src/gradient-entry.jsx'],
  outfile: 'dist/gradient-ascii.js',
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  jsx: 'automatic',
  legalComments: 'linked',
});
