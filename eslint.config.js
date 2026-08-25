import stylex from '@stylexjs/eslint-plugin'
import tseslint from 'typescript-eslint'

// Official: valid-styles + no-unused so leftover atoms fail the build.
// https://stylexjs.com/docs/api/configuration/eslint-plugin
export default [
  { ignores: ['dist/**', 'node_modules/**', '.astro/**'] },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
    },
    plugins: {
      '@stylexjs': stylex,
    },
    rules: {
      '@stylexjs/valid-styles': 'error',
      '@stylexjs/no-unused': 'error',
    },
  },
]
