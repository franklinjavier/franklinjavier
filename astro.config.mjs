// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import { satteri } from '@astrojs/markdown-satteri'
import { diagramsPlugin } from './src/diagrams/plugin.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://franklinjavier.com',
  output: 'static',
  build: {
    format: 'directory', // Creates /posts/title/index.html
    // Keep the article prose sheet as a real CSS asset so home / blog index /
    // speaking / 404 do not download .prose. Astro's default `auto` inlines
    // sheets under 4kb, which would fold that sheet into article HTML.
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
    // Sätteri is Astro's default processor; the plugin swaps
    // <figure data-diagram="…"></figure> placeholders for inline SVG figures.
    processor: satteri({ hastPlugins: [diagramsPlugin] }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'vesper',
      defaultColor: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
