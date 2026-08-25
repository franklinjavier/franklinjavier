// @ts-check
import { defineConfig } from 'astro/config'
import stylex from '@stylexjs/unplugin'

// Official StyleX Vite compiler: https://stylexjs.com/docs/learn/installation/vite
// runtimeInjection: false keeps this compile-time atomic CSS, not runtime CSS-in-JS.
// https://astro.build/config
export default defineConfig({
  site: 'https://franklinjavier.com',
  output: 'static',
  build: {
    format: 'directory', // Creates /posts/title/index.html
    // Official StyleX Vite plugin appends compiled CSS to an emitted stylesheet.
    // Astro's default `auto` inlines sheets under 4kb, which hid StyleX on every
    // page except 404. Keep a real CSS asset, same as the previous Tailwind build.
    inlineStylesheets: 'never',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'vesper',
      defaultColor: false,
    },
  },
  vite: {
    plugins: [
      stylex.vite({
        // Official Vite example. Reset is in @layer reset so this still wins.
        // https://stylexjs.com/docs/learn/installation/vite
        useCSSLayers: true,
        runtimeInjection: false,
        // Prefer the shared layout stylesheet over page-scoped CSS (e.g. 404).
        cssInjectionTarget: (fileName) => fileName.endsWith('.css') && !fileName.includes('404'),
      }),
    ],
  },
})
