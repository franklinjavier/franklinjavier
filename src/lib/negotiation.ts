// Content negotiation helpers shared by the Vercel Edge Middleware and tests.
// Kept free of Astro/Vercel imports so they can be unit-tested directly.

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
