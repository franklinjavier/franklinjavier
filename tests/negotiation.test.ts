import { describe, expect, test } from 'bun:test'
import {
  prefersMarkdown,
  markdownPathFor,
  markdownSuffixPage,
  markdownUrlFor,
  markdownLinkHeader,
  isPostPath,
} from '../src/lib/negotiation'

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

describe('markdownSuffixPage', () => {
  test('maps <page>.md to the page path', () => {
    expect(markdownSuffixPage('/pt-br/blog/lisbon-ai-2026.md')).toBe('/pt-br/blog/lisbon-ai-2026')
    expect(markdownSuffixPage('/about.md')).toBe('/about')
  })

  test('maps /index.md-style twins and non-markdown paths to null', () => {
    expect(markdownSuffixPage('/index.md')).toBeNull()
    expect(markdownSuffixPage('/blog/index.md')).toBeNull()
    expect(markdownSuffixPage('/blog/')).toBeNull()
    expect(markdownSuffixPage('/rss.xml')).toBeNull()
  })
})

describe('markdownUrlFor', () => {
  test('returns the absolute URL of the markdown twin', () => {
    expect(markdownUrlFor('/blog/how-always-on-agents-work/')).toBe(
      'https://franklinjavier.com/blog/how-always-on-agents-work/index.md',
    )
    expect(markdownUrlFor('/blog/how-always-on-agents-work')).toBe(
      'https://franklinjavier.com/blog/how-always-on-agents-work/index.md',
    )
  })
})

describe('markdownLinkHeader', () => {
  test('builds the exact Link header value', () => {
    expect(markdownLinkHeader('/pt-br/blog/como-funciona-um-agente-sempre-ligado/')).toBe(
      '<https://franklinjavier.com/pt-br/blog/como-funciona-um-agente-sempre-ligado/index.md>; rel="alternate"; type="text/markdown"',
    )
  })
})

describe('isPostPath', () => {
  test('matches EN and PT-BR posts with and without trailing slash', () => {
    expect(isPostPath('/blog/how-always-on-agents-work/')).toBe(true)
    expect(isPostPath('/blog/how-always-on-agents-work')).toBe(true)
    expect(isPostPath('/pt-br/blog/como-funciona-um-agente-sempre-ligado/')).toBe(true)
    expect(isPostPath('/pt-br/blog/como-funciona-um-agente-sempre-ligado')).toBe(true)
  })

  test('rejects the blog indexes and the homepages', () => {
    expect(isPostPath('/blog/')).toBe(false)
    expect(isPostPath('/blog')).toBe(false)
    expect(isPostPath('/pt-br/blog/')).toBe(false)
    expect(isPostPath('/pt-br/blog')).toBe(false)
    expect(isPostPath('/')).toBe(false)
    expect(isPostPath('/pt-br/')).toBe(false)
  })

  test('rejects tag pages', () => {
    expect(isPostPath('/blog/tag/')).toBe(false)
    expect(isPostPath('/blog/tag/ai/')).toBe(false)
    expect(isPostPath('/pt-br/blog/tag/ai')).toBe(false)
  })

  test('rejects paths with a dot, nested paths and other sections', () => {
    expect(isPostPath('/blog/how-always-on-agents-work.md')).toBe(false)
    expect(isPostPath('/blog/how-always-on-agents-work/index.md')).toBe(false)
    expect(isPostPath('/blog/foo/bar/')).toBe(false)
    expect(isPostPath('/posts/qual-melhor-os')).toBe(false)
    expect(isPostPath('/about/')).toBe(false)
  })

  test('rejects percent-encoded and uppercase slugs', () => {
    expect(isPostPath('/blog/%68ow-always-on-agents-work/')).toBe(false)
    expect(isPostPath('/pt-br/blog/%63omo-funciona-um-agente-sempre-ligado')).toBe(false)
    expect(isPostPath('/blog/How-Always-On-Agents-Work/')).toBe(false)
    expect(isPostPath('/pt-br/blog/COMO-FUNCIONA-UM-AGENTE-SEMPRE-LIGADO/')).toBe(false)
  })
})
