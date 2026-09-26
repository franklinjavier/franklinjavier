import { next, rewrite } from '@vercel/edge'
import {
  prefersMarkdown,
  markdownPathFor,
  markdownSuffixPage,
  notFoundMarkdown,
} from './src/lib/negotiation.js'

// Vercel Edge Middleware: serves the pre-rendered markdown twin of a page
// (see src/pages/[...path]/index.md.ts) when a client asks for it with
// `Accept: text/markdown`, per https://acceptmarkdown.com. Paths with no
// markdown twin get a markdown 404 body so agents can recover.
// Also serves `<page>.md` (e.g. /blog/foo.md) as the twin of /blog/foo/.
// Runs on extension-less page routes and .md paths; other assets are excluded.

export const config = {
  matcher: ['/', '/((?!.*\\.).*)', '/(.*)\\.md'],
}

const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  Vary: 'Accept',
}

export default async function middleware(request: Request) {
  const url = new URL(request.url)

  // Pre-rendered twins (…/index.md) are static files; serve them as is.
  if (url.pathname.endsWith('/index.md')) return next()

  const suffixPage = markdownSuffixPage(url.pathname)
  const wantsMarkdown =
    suffixPage !== null ||
    // Legacy /posts/* URLs are handled by the redirects in vercel.json.
    (prefersMarkdown(request.headers.get('accept')) && !url.pathname.startsWith('/posts/'))

  if (wantsMarkdown) {
    const markdownUrl = new URL(markdownPathFor(suffixPage ?? url.pathname), url)

    let exists = true
    try {
      const cookie = request.headers.get('cookie')
      const probe = await fetch(markdownUrl, {
        method: 'HEAD',
        headers: cookie ? { cookie } : undefined,
      })
      exists = probe.ok
    } catch {
      // On probe failure, fall through to the rewrite - worst case the
      // response is the platform 404, same as before this check existed.
    }

    if (!exists) {
      return new Response(notFoundMarkdown(url.pathname), {
        status: 404,
        headers: MARKDOWN_HEADERS,
      })
    }

    return rewrite(markdownUrl, { headers: MARKDOWN_HEADERS })
  }

  return next({
    headers: { Vary: 'Accept' },
  })
}
