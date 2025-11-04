// eslint.config.mjs
import createEslintConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // 1. The default Next.js configuration
  createEslintConfig(),

  // 2. Add the Prettier configuration
  // This disables ESLint rules that would conflict with Prettier.
  // Make sure this is the LAST item in the array.
  prettierConfig,
];

export default config;