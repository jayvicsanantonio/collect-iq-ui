// Flat ESLint config for ESLint v9+
// Uses @eslint/js base, TypeScript-ESLint recommended, and Prettier formatting enforcement

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      '.pnpm-store/**',
      'dist/**',
      'build/**',
      'lib/**',
      'coverage/**',
      '.next/**',
      'out/**',
      '.turbo/**',
      '.eslintcache',
      '**/*.tsbuildinfo',
    ],
  },
  js.configs.recommended,
  // TypeScript ESLint recommended rules (no type-aware rules to keep it fast)
  ...tseslint.configs.recommended,
  // Disable rules that conflict with Prettier
  eslintConfigPrettier,
  // Enforce Prettier formatting via ESLint
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
