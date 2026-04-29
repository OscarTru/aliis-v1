/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['.next', 'node_modules', 'out', 'dist', 'build'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': require('@next/eslint-plugin-next'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    rules: {
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
];

module.exports = config;
