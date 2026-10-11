import type { MarkdownHeading } from 'astro'

/** Optional short TOC labels from a post's frontmatter, keyed by heading slug. */
export type TocLabels = Record<string, string>

export interface TocItem {
  slug: string
  depth: 2 | 3
  /** Full heading text (used for the link's title attribute). */
  text: string
  /** Short label shown in the TOC; the heading text when no override exists. */
  label: string
  /** "01", "02", … for top-level (h2) items; undefined for h3. */
  number?: string
}

/** Slug of the visually hidden h2 that GFM footnotes add; not a section. */
const FOOTNOTE_LABEL = 'footnote-label'

/** h2/h3 headings that make up a post's table of contents. */
export function tocHeadings(headings: MarkdownHeading[] = []): MarkdownHeading[] {
  return headings.filter(
    (heading) => (heading.depth === 2 || heading.depth === 3) && heading.slug !== FOOTNOTE_LABEL,
  )
}

/** A TOC with a single entry is noise; only render it from two headings up. */
export function hasToc(headings: MarkdownHeading[] = []): boolean {
  return tocHeadings(headings).length >= 2
}

/** TOC entries with short-label overrides applied and h2 sections numbered. */
export function tocItems(headings: MarkdownHeading[] = [], labels: TocLabels = {}): TocItem[] {
  let section = 0
  return tocHeadings(headings).map((heading) => {
    const depth = heading.depth as 2 | 3
    const label = labels[heading.slug]?.trim() || heading.text
    const number = depth === 2 ? String(++section).padStart(2, '0') : undefined
    return { slug: heading.slug, depth, text: heading.text, label, number }
  })
}
