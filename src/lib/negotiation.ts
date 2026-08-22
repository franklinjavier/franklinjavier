// Content negotiation helpers shared by the Vercel Edge Middleware and tests.
// Kept free of Astro/Vercel imports so they can be unit-tested directly.

import { SITE_URL } from './site.js'

/**
 * Returns true when the request's Accept header explicitly asks for
 * text/markdown at least as strongly as text/html.
 * Browsers never send text/markdown, so regular visitors keep getting HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false

  let markdownQ = 0
  let htmlQ = 0

  for (const part of accept.split(',')) {
    const [rawType, ...params] = part.trim().split(';')
    const type = rawType?.trim().toLowerCase()
    if (!type) continue

    let q = 1
    for (const param of params) {
      const [key, value] = param.trim().split('=')
      if (key === 'q' && value !== undefined) {
        const parsed = Number.parseFloat(value)
        if (!Number.isNaN(parsed)) q = parsed
      }
    }

    if (type === 'text/markdown') markdownQ = Math.max(markdownQ, q)
    if (type === 'text/html') htmlQ = Math.max(htmlQ, q)
  }

  return markdownQ > 0 && markdownQ >= htmlQ
}

/**
 * Maps a page pathname to the path of its pre-rendered markdown variant.
 * Every HTML page is built as a directory index, and its markdown twin
 * lives next to it as index.md (e.g. /blog/foo/ -> /blog/foo/index.md).
 */
export function markdownPathFor(pathname: string): string {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return `${normalized}index.md`
}

/**
 * Markdown body served with a 404 status to clients that asked for
 * text/markdown on a path that has no markdown twin, so agents get
 * recovery links instead of the HTML 404 shell.
 */
export function notFoundMarkdown(pathname: string): string {
  return `# 404 — Page not found

Nothing exists at \`${pathname}\` on this site.

Where to look next:

- [Homepage](${SITE_URL}/)
- [Blog index](${SITE_URL}/blog/)
- [Sitemap](${SITE_URL}/sitemap.xml): all indexable URLs
- [llms.txt](${SITE_URL}/llms.txt): guide for AI agents, with the full list of pages

Every HTML page on this site has a markdown twin at \`<page-url>/index.md\`, also served when you request the page URL with \`Accept: text/markdown\`.
`
}
