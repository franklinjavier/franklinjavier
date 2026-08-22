import { next, rewrite } from '@vercel/edge'
import { prefersMarkdown, markdownPathFor } from './src/lib/negotiation.js'

// Vercel Edge Middleware: serves the pre-rendered markdown twin of a page
// (see src/pages/[...path]/index.md.ts) when a client asks for it with
// `Accept: text/markdown`, per https://acceptmarkdown.com.
// Runs only on extension-less page routes; static assets are excluded.

export const config = {
  matcher: ['/', '/((?!.*\\.).*)'],
}

export default function middleware(request: Request) {
  const url = new URL(request.url)

  if (prefersMarkdown(request.headers.get('accept'))) {
    const markdownUrl = new URL(markdownPathFor(url.pathname), url)
    return rewrite(markdownUrl, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
      },
    })
  }

  return next({
    headers: { Vary: 'Accept' },
  })
}
