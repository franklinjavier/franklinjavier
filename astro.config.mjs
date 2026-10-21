// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import { satteri } from '@astrojs/markdown-satteri'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { diagramsPlugin } from './src/diagrams/plugin.ts'

// The content layer caches rendered markdown in its data store and only
// re-renders an entry when its text changes, so a diagram-only edit would ship
// stale SVGs (dev, and Vercel builds that restore node_modules/.astro). Astro
// clears the whole store when the JSON of the config changes, and that JSON
// includes the plugin object, so a hash of src/diagrams on it busts the cache.
// That check runs when the content layer starts, so a fresh `astro dev` or
// build picks up diagram edits. A running dev server does not: Astro's
// in-process restart keeps the content layer (and its markdown renderer) from
// startup, and refreshContent() skips entries whose text is unchanged, so
// there is no supported way to re-render them live. The integration below only
// warns that a manual restart is needed.
const diagramsDir = fileURLToPath(new URL('./src/diagrams/', import.meta.url))
const diagramFiles = readdirSync(diagramsDir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name))
  .sort()
const diagramsHash = createHash('sha256')
for (const file of diagramFiles)
  diagramsHash.update(relative(diagramsDir, file)).update(readFileSync(file))
const diagrams = { ...diagramsPlugin, sourceHash: diagramsHash.digest('hex') }

// https://astro.build/config
export default defineConfig({
  // SITE_URL build variable: set only by the blog-preview Workers Builds trigger (https://docs.astro.build/en/reference/configuration-reference/#site).
  site: process.env.SITE_URL || 'https://franklinjavier.com',
  output: 'static',
  // <link rel="prefetch"> on hover, with a fetch() fallback. Not Speculation Rules.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
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
    processor: satteri({ hastPlugins: [diagrams] }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'vesper',
      defaultColor: false,
    },
  },
  integrations: [
    {
      name: 'diagrams-watch',
      hooks: {
        'astro:server:setup': ({ server, logger }) => {
          server.watcher.add(diagramsDir)
          // 'all' also reports files added after startup.
          server.watcher.on('all', (event, file) => {
            if (file.startsWith(diagramsDir))
              logger.warn(
                `src/diagrams/${relative(diagramsDir, file)} (${event}): restart the dev server to re-render posts with diagrams`,
              )
          })
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
