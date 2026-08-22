import { afterEach, describe, expect, test } from 'bun:test'
import middleware from '../middleware'

// The middleware probes the static deployment for the markdown twin with a
// HEAD fetch; stub fetch to control which paths "exist".
const realFetch = globalThis.fetch

function stubFetch(existingPaths: string[]) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : input)
    const ok = existingPaths.includes(url.pathname)
    return new Response(null, { status: ok ? 200 : 404 })
  }) as typeof fetch
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('edge middleware', () => {
  test('rewrites markdown requests to the pre-rendered .md twin', async () => {
    stubFetch(['/blog/index.md'])
    const response = await middleware(
      new Request('https://franklinjavier.com/blog/', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://franklinjavier.com/blog/index.md',
    )
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect(response.headers.get('vary')).toBe('Accept')
  })

  test('rewrites the homepage to /index.md', async () => {
    stubFetch(['/index.md'])
    const response = await middleware(
      new Request('https://franklinjavier.com/', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://franklinjavier.com/index.md')
  })

  test('serves a markdown 404 body when the path has no markdown twin', async () => {
    stubFetch(['/index.md'])
    const response = await middleware(
      new Request('https://franklinjavier.com/does-not-exist/', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.status).toBe(404)
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect(response.headers.get('vary')).toBe('Accept')
    const body = await response.text()
    expect(body).toMatch(/^# 404/)
    expect(body).toContain('https://franklinjavier.com/sitemap.xml')
    expect(body).toContain('https://franklinjavier.com/llms.txt')
    expect(body).toContain('https://franklinjavier.com/blog/')
  })

  test('falls back to the rewrite when the existence probe fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    const response = await middleware(
      new Request('https://franklinjavier.com/blog/', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://franklinjavier.com/blog/index.md',
    )
  })

  test('leaves legacy /posts/ URLs to the vercel.json redirect', async () => {
    stubFetch([])
    const response = await middleware(
      new Request('https://franklinjavier.com/posts/qual-melhor-os', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  test('passes browser requests through with Vary: Accept', async () => {
    stubFetch([])
    const response = await middleware(
      new Request('https://franklinjavier.com/', {
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('vary')).toBe('Accept')
  })
})
