import type { MarkdownHeading } from 'astro'

/** h2/h3 headings that make up a post's table of contents. */
export function tocHeadings(headings: MarkdownHeading[] = []): MarkdownHeading[] {
  return headings.filter((heading) => heading.depth === 2 || heading.depth === 3)
}

/** A TOC with a single entry is noise; only render it from two headings up. */
export function hasToc(headings: MarkdownHeading[] = []): boolean {
  return tocHeadings(headings).length >= 2
}
