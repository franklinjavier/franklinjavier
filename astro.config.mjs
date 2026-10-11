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
// The watch files make `astro dev` restart (and so re-check) on diagram edits.
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
        'astro:config:setup': ({ addWatchFile }) =>
          diagramFiles.forEach((file) => addWatchFile(file)),
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
