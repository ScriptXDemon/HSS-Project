import nextCoreWebVitals from './apps/web/node_modules/eslint-config-next/dist/core-web-vitals.js';
import nextTypescript from './apps/web/node_modules/eslint-config-next/dist/typescript.js';

export default [
  {
    ignores: ['**/.next/**', '**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];
