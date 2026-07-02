import { config } from '@workspace/eslint-config/react-internal'

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ['src/routeTree.gen.ts', '.nitro/**', '.output/**', '.tanstack/**', 'dist/**', 'node_modules/**'],
  },
  ...config,
]
