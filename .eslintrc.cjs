/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {},
    },
  ],
};
