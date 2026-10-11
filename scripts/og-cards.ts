// Social preview cards (og:image / twitter:image, 1200x630 PNG) for every
// part of the agent-experiments series, in both languages. Titles and the
// series marker come from src/data/series.ts and src/i18n/ui.ts (the build
// fails if the series data and the posts disagree), so re-running after a
// retitle keeps the cards in sync. The posts point at the files through their
// `image` frontmatter.
//
// Usage: bun run og   (writes public/images/og/<translationKey>-<lang>.png)
//
// Rasterized by sharp (librsvg) with fonts already installed on the machine;
// nothing is embedded or shipped. Re-running on the same machine gives the
// same bytes; another machine with different fonts gives slightly different
// glyphs, so commit the PNGs rather than generating them at build time.
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { SERIES } from '../src/data/series'
import { ui } from '../src/i18n/ui'
import type { Lang } from '../src/lib/markdown'

const SERIES_KEY = 'agent-experiments'
const OUT_DIR = 'public/images/og'
const WIDTH = 1200
const HEIGHT = 630
const PAD = 80

// Site tokens (src/styles/global.css, light theme).
const BG = '#fafafa'
const INK = '#171717'
const MUTED = '#737373'
const RULE = '#ebebeb'

// The site's serif stack is Apple/Windows system faces; these are the close
// metric matches that ship with common Linux font sets.
const SERIF = "'Source Serif Pro', 'Source Serif 4', 'Noto Serif', 'DejaVu Serif', serif"
const SANS = "'Inter', 'Noto Sans', 'DejaVu Sans', sans-serif"

const TITLE_SIZE = 76
const TITLE_LEADING = 1.15
// librsvg does not wrap text; ~0.5em per glyph at this size fills the width.
const TITLE_MAX_CHARS = 26

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]))
}

function card(title: string, marker: string): string {
  const lines = wrap(title, TITLE_MAX_CHARS)
  const lineHeight = TITLE_SIZE * TITLE_LEADING
  // Title block sits on the vertical centre, a little above it.
  const firstBaseline = HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2 + TITLE_SIZE * 0.3
  const titleLines = lines
    .map(
      (line, index) =>
        `<text x="${PAD}" y="${(firstBaseline + index * lineHeight).toFixed(1)}">${escapeXml(line)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="${BG}"/>
  <text x="${PAD}" y="${PAD + 22}" font-family="${SANS}" font-size="28" fill="${MUTED}">${escapeXml(marker)}</text>
  <g font-family="${SERIF}" font-size="${TITLE_SIZE}" font-weight="500" fill="${INK}" letter-spacing="-0.5">${titleLines}</g>
  <line x1="${PAD}" y1="${HEIGHT - PAD - 52}" x2="${WIDTH - PAD}" y2="${HEIGHT - PAD - 52}" stroke="${RULE}" stroke-width="2"/>
  <text x="${PAD}" y="${HEIGHT - PAD}" font-family="${SANS}" font-size="28" fill="${MUTED}">franklinjavier.com</text>
</svg>`
}

const series = SERIES[SERIES_KEY]
mkdirSync(OUT_DIR, { recursive: true })

for (const part of series.parts) {
  for (const lang of Object.keys(part.posts) as Lang[]) {
    const marker = fill(ui[lang]['series.marker'], {
      part: part.part,
      total: series.parts.length,
      name: series.name[lang],
    })
    const output = join(OUT_DIR, `${part.translationKey}-${lang}.png`)
    await sharp(Buffer.from(card(part.posts[lang].title, marker)))
      .png({ compressionLevel: 9, palette: true, colours: 64 })
      .toFile(output)
    console.log(`wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`)
  }
}
