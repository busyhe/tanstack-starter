import { config } from '@workspace/eslint-config/base'
import globals from 'globals'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ['apps/**', 'packages/**'],
  },
  {
    files: ['*.{js,mjs,cjs}', 'scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
