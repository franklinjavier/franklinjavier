import { describe, expect, test } from 'bun:test'
import middleware from '../middleware'

describe('edge middleware', () => {
  test('rewrites markdown requests to the pre-rendered .md twin', () => {
    const response = middleware(
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

  test('rewrites the homepage to /index.md', () => {
    const response = middleware(
      new Request('https://franklinjavier.com/', {
        headers: { accept: 'text/markdown' },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://franklinjavier.com/index.md',
    )
  })

  test('passes browser requests through with Vary: Accept', () => {
    const response = middleware(
      new Request('https://franklinjavier.com/', {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
    )
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('vary')).toBe('Accept')
  })
})
