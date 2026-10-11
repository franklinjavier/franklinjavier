// Post series: markers and part links generated from src/data/series.ts.
// Kept free of astro:content imports so it stays unit-testable;
// callers pass plain post data.

import { ui } from '../i18n/ui'
import { SERIES, type Series } from '../data/series'
import type { Lang } from './markdown'

export interface SeriesRef {
  key: string
  part: number
}

export interface SeriesLink {
  part: number
  title: string
  url: string
}

export interface SeriesNav {
  name: string
  part: number
  /** Number of parts listed in the series data. */
  total: number
  previous?: SeriesLink
  next?: SeriesLink
}

/** Published post as seen by the drift check. */
export interface SeriesPost {
  lang: Lang
  title: string
  url: string
  translationKey?: string
  series?: SeriesRef
}

/** Marker and neighbouring parts of `ref` in `lang`; throws when the data has no such part. */
export function seriesNav(
  ref: SeriesRef,
  lang: Lang,
  catalog: Record<string, Series> = SERIES,
): SeriesNav {
  const series = catalog[ref.key]
  if (!series) throw new Error(`Unknown series "${ref.key}"; add it to src/data/series.ts`)
  const parts = [...series.parts].sort((a, b) => a.part - b.part)
  const index = parts.findIndex((p) => p.part === ref.part)
  if (index === -1) {
    throw new Error(`Series "${ref.key}" has no part ${ref.part} in src/data/series.ts`)
  }
  const link = (i: number): SeriesLink | undefined => {
    const entry = parts[i]
    return entry && { part: entry.part, title: entry.posts[lang].title, url: entry.posts[lang].url }
  }
  return {
    name: series.name[lang],
    part: ref.part,
    total: parts.length,
    previous: link(index - 1),
    next: link(index + 1),
  }
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  )
}

/** "Part 2 of 2 · experiments with agents" */
export function seriesMarker(nav: SeriesNav, lang: Lang): string {
  return fill(ui[lang]['series.marker'], { part: nav.part, total: nav.total, name: nav.name })
}

/** "Part 1: <title>" */
export function seriesPartLabel(link: SeriesLink, lang: Lang): string {
  return fill(ui[lang]['series.part'], { part: link.part, title: link.title })
}

/** "Next: Part 2 · <title>" */
export function seriesNextLabel(link: SeriesLink, lang: Lang): string {
  return fill(ui[lang]['series.next'], { part: link.part, title: link.title })
}

/**
 * Differences between the series data and the published posts, as readable messages.
 * Empty when every data entry matches a post (title, URL, language, part) and every
 * post with `series` frontmatter is listed in the data.
 */
export function seriesDrift(
  posts: SeriesPost[],
  catalog: Record<string, Series> = SERIES,
): string[] {
  const problems: string[] = []
  const byUrl = new Map(posts.map((post) => [post.url, post]))

  for (const [key, series] of Object.entries(catalog)) {
    const numbers = series.parts.map((p) => p.part).sort((a, b) => a - b)
    if (numbers.some((n, i) => n !== i + 1)) {
      problems.push(
        `${key}: parts must be numbered 1..${numbers.length}, got ${numbers.join(', ')}`,
      )
    }
    for (const entry of series.parts) {
      for (const [lang, expected] of Object.entries(entry.posts) as [
        Lang,
        typeof entry.posts.en,
      ][]) {
        const where = `${key} part ${entry.part} (${lang})`
        const post = byUrl.get(expected.url)
        if (!post) {
          problems.push(`${where}: no published post at ${expected.url}`)
          continue
        }
        if (post.lang !== lang) problems.push(`${where}: post language is ${post.lang}`)
        if (post.title !== expected.title) {
          problems.push(`${where}: title "${expected.title}" but post says "${post.title}"`)
        }
        if (post.translationKey !== entry.translationKey) {
          problems.push(
            `${where}: translationKey ${entry.translationKey} but post says ${post.translationKey}`,
          )
        }
        if (post.series?.key !== key || post.series.part !== entry.part) {
          problems.push(`${where}: post frontmatter series is ${JSON.stringify(post.series)}`)
        }
      }
    }
  }

  for (const post of posts) {
    if (!post.series) continue
    const { key, part } = post.series
    const listed = catalog[key]?.parts.some(
      (entry) => entry.part === part && entry.posts[post.lang]?.url === post.url,
    )
    if (!listed) problems.push(`${post.url}: series ${key} part ${part} is not listed in the data`)
  }

  return problems
}
