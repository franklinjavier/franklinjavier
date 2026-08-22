import { next, rewrite } from '@vercel/edge'
import { prefersMarkdown, markdownPathFor, notFoundMarkdown } from './src/lib/negotiation.js'

// Vercel Edge Middleware: serves the pre-rendered markdown twin of a page
// (see src/pages/[...path]/index.md.ts) when a client asks for it with
// `Accept: text/markdown`, per https://acceptmarkdown.com. Paths with no
// markdown twin get a markdown 404 body so agents can recover.
// Runs only on extension-less page routes; static assets are excluded.

export const config = {
  matcher: ['/', '/((?!.*\\.).*)'],
}

const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  Vary: 'Accept',
}

export default async function middleware(request: Request) {
  const url = new URL(request.url)

  // Legacy /posts/* URLs are handled by the redirects in vercel.json.
  if (prefersMarkdown(request.headers.get('accept')) && !url.pathname.startsWith('/posts/')) {
    const markdownUrl = new URL(markdownPathFor(url.pathname), url)

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
