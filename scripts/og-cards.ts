// Social preview cards (og:image / twitter:image, 1200x630 PNG): the site-wide
// default (SITE_SOCIAL_IMAGE) and one for every part of the agent-experiments
// series, in both languages. Titles and the series marker come from
// src/data/series.ts and src/i18n/ui.ts (the build fails if the series data
// and the posts disagree), so re-running after a retitle keeps the cards in
// sync. The posts point at the files through their `image` frontmatter.
//
// Usage: bun run og   (writes public/images/og/site.png and
// public/images/og/<translationKey>-<lang>.png)
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
import { SITE_AUTHOR, SITE_SOCIAL_IMAGE } from '../src/lib/site'

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

// Dark theme tokens, plus the favicon's tile colours (public/favicon.svg).
const DARK_BG = '#111111'
const DARK_INK = '#ededed'
const DARK_MUTED = '#808080'
const DARK_RULE = '#3a3a3a'
const TILE = '#171717'
const TILE_INK = '#f3f4f6'

// The site's serif stack is Apple/Windows system faces; these are the close
// metric matches that ship with common Linux font sets.
const SERIF = "'Source Serif Pro', 'Source Serif 4', 'Noto Serif', 'DejaVu Serif', serif"
const SANS = "'Inter', 'Noto Sans', 'DejaVu Sans', sans-serif"
// The site card is generated on macOS, so it can use the site's mono faces.
const MONO = "'SF Mono', Menlo, 'DejaVu Sans Mono', monospace"

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

// Site-wide card: the favicon's FJ tile over a dot grid that fades out at the
// edges. Everything sits in the centre square, so previews that crop to 1:1
// (WhatsApp) keep the whole composition.
function siteCard(): string {
  const tile = 176
  const tileX = (WIDTH - tile) / 2
  const tileY = 120
  const centre = WIDTH / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse" x="15" y="0">
      <circle cx="15" cy="15" r="1.6" fill="#ffffff"/>
    </pattern>
    <radialGradient id="fade" cx="50%" cy="50%" r="62%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <mask id="grid"><rect width="100%" height="100%" fill="url(#fade)"/></mask>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${DARK_BG}"/>
  <rect width="100%" height="100%" fill="url(#dots)" mask="url(#grid)"/>
  <ellipse cx="${centre}" cy="${HEIGHT / 2}" rx="460" ry="330" fill="url(#glow)"/>
  <rect x="${tileX}" y="${tileY}" width="${tile}" height="${tile}" rx="${tile * (6 / 32)}" fill="${TILE}" stroke="${DARK_RULE}" stroke-width="2"/>
  <text x="${centre}" y="${tileY + tile * (22.5 / 32)}" font-family="${SANS}" font-size="${tile / 2}" font-weight="700" fill="${TILE_INK}" text-anchor="middle" letter-spacing="-2.75">FJ</text>
  <text x="${centre}" y="412" font-family="${MONO}" font-size="64" font-weight="500" fill="${DARK_INK}" text-anchor="middle" letter-spacing="-1">${escapeXml(SITE_AUTHOR)}</text>
  <text x="${centre}" y="${HEIGHT - 64}" font-family="${SANS}" font-size="26" fill="${DARK_MUTED}" text-anchor="middle">franklinjavier.com</text>
</svg>`
}

const series = SERIES[SERIES_KEY]
mkdirSync(OUT_DIR, { recursive: true })

const siteOutput = join('public', SITE_SOCIAL_IMAGE)
await sharp(Buffer.from(siteCard())).png({ compressionLevel: 9 }).toFile(siteOutput)
console.log(`wrote ${siteOutput} (${Math.round(statSync(siteOutput).size / 1024)} KB)`)

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
