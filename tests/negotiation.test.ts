import { describe, expect, test } from 'bun:test'
import { prefersMarkdown, markdownPathFor } from '../src/lib/negotiation'

describe('prefersMarkdown', () => {
  test('accepts a plain text/markdown request', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true)
  })

  test('accepts text/markdown with parameters and other types', () => {
    expect(prefersMarkdown('text/markdown;q=1, text/plain;q=0.8')).toBe(true)
    expect(prefersMarkdown('text/markdown, */*;q=0.1')).toBe(true)
  })

  test('prefers markdown when its q-value beats html', () => {
    expect(prefersMarkdown('text/html;q=0.5, text/markdown;q=0.9')).toBe(true)
  })

  test('keeps html for browser-style Accept headers', () => {
    expect(
      prefersMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      ),
    ).toBe(false)
  })

  test('ignores wildcard-only and missing headers', () => {
    expect(prefersMarkdown('*/*')).toBe(false)
    expect(prefersMarkdown(null)).toBe(false)
    expect(prefersMarkdown('')).toBe(false)
  })

  test('respects q=0 opt-out of markdown', () => {
    expect(prefersMarkdown('text/markdown;q=0, text/html')).toBe(false)
  })

  test('html wins when its q-value is higher', () => {
    expect(prefersMarkdown('text/markdown;q=0.4, text/html;q=0.9')).toBe(false)
  })
})

describe('markdownPathFor', () => {
  test('maps the root to /index.md', () => {
    expect(markdownPathFor('/')).toBe('/index.md')
  })

  test('maps directory URLs with and without trailing slash', () => {
    expect(markdownPathFor('/blog/')).toBe('/blog/index.md')
    expect(markdownPathFor('/blog')).toBe('/blog/index.md')
    expect(markdownPathFor('/pt-br/blog/avaliando-respostas-openai/')).toBe(
      '/pt-br/blog/avaliando-respostas-openai/index.md',
    )
    expect(markdownPathFor('/about')).toBe('/about/index.md')
  })
})
