// Assertions against the built site in dist/. Run `bun run build` first
// (the `bun test` script in package.json does this for you via `bun run check`).
import { beforeAll, describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(import.meta.dir, '..', 'dist')

function read(path: string): string {
  return readFileSync(join(DIST, path), 'utf-8')
}

function jsonLdBlocks(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = []
  const pattern = /<script type="application\/ld\+json">(.*?)<\/script>/gs
  for (const match of html.matchAll(pattern)) {
    const decoded = match[1]
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&amp;', '&')
    blocks.push(JSON.parse(decoded))
  }
  return blocks
}

beforeAll(() => {
  if (!existsSync(DIST)) {
    throw new Error('dist/ not found - run `bun run build` before `bun test`')
  }
})

describe('homepage metadata', () => {
  const html = () => read('index.html')

  test('has canonical URL, og:image and og:type', () => {
    expect(html()).toContain('<link rel="canonical" href="https://franklinjavier.com/">')
    expect(html()).toContain('property="og:type" content="website"')
    expect(html()).toContain(
      'property="og:image" content="https://franklinjavier.com/img/frank.jpeg"',
    )
    expect(html()).toContain('<html lang="en"')
  })

  test('has Person JSON-LD with contactPoint, address and sameAs', () => {
    const graphBlock = jsonLdBlocks(html()).find((block) => '@graph' in block)
    expect(graphBlock).toBeDefined()
    const graph = (graphBlock as { '@graph': Record<string, unknown>[] })['@graph']
    const person = graph.find((node) => node['@type'] === 'Person')
    const website = graph.find((node) => node['@type'] === 'WebSite')
    expect(website).toBeDefined()
    expect(person).toMatchObject({
      name: 'Franklin Javier',
      url: 'https://franklinjavier.com/',
    })
    expect(person?.contactPoint).toMatchObject({ email: 'franklinjalves@gmail.com' })
    expect(person?.address).toMatchObject({ addressLocality: 'Lisbon', addressCountry: 'PT' })
    expect(person?.sameAs).toContain('https://github.com/franklinjavier')
  })
})

describe('blog post pages', () => {
  test('have BlogPosting JSON-LD and og:type article', () => {
    const html = read('blog/how-to-be-proactive/index.html')
    expect(html).toContain('property="og:type" content="article"')
    const posting = jsonLdBlocks(html).find((block) => block['@type'] === 'BlogPosting')
    expect(posting).toBeDefined()
    expect(posting?.headline).toBeTruthy()
    expect(posting?.datePublished).toBeTruthy()
  })
})

describe('markdown variants', () => {
  test('exist for the homepage, indexes, posts and trust pages in both languages', () => {
    const paths = [
      'index.md',
      'pt-br/index.md',
      'blog/index.md',
      'pt-br/blog/index.md',
      'blog/how-to-be-proactive/index.md',
      'pt-br/blog/como-ser-pessoa-propositiva/index.md',
      'about/index.md',
      'contact/index.md',
      'privacy/index.md',
      'pt-br/about/index.md',
      'pt-br/contact/index.md',
      'pt-br/privacy/index.md',
    ]
    for (const path of paths) {
      expect(existsSync(join(DIST, path))).toBe(true)
    }
  })

  test('post markdown carries title, canonical URL and raw markdown body', () => {
    const md = read('blog/how-to-be-proactive/index.md')
    expect(md).toMatch(/^# /)
    expect(md).toContain(
      '- Canonical: https://franklinjavier.com/blog/how-to-be-proactive/',
    )
  })

  test('homepage markdown links to blog, about, contact and privacy', () => {
    const md = read('index.md')
    for (const path of ['/blog/', '/about/', '/contact/', '/privacy/']) {
      expect(md).toContain(`https://franklinjavier.com${path}`)
    }
  })
})

describe('llms.txt', () => {
  const txt = () => read('llms.txt')

  test('has when-to-use guidance', () => {
    expect(txt()).toContain('## When to use this site')
    expect(txt()).toContain('## How to consume this site')
  })

  test('links the trust pages and machine-readable indexes', () => {
    expect(txt()).toContain('https://franklinjavier.com/about/')
    expect(txt()).toContain('https://franklinjavier.com/contact/')
    expect(txt()).toContain('https://franklinjavier.com/sitemap.xml')
    expect(txt()).toContain('https://franklinjavier.com/rss.xml')
  })

  test('lists blog posts in both languages', () => {
    expect(txt()).toContain('## Blog posts (English)')
    expect(txt()).toContain('## Blog posts (Português)')
    expect(txt()).toContain('https://franklinjavier.com/blog/how-to-be-proactive/')
    expect(txt()).toContain(
      'https://franklinjavier.com/pt-br/blog/como-ser-pessoa-propositiva/',
    )
  })
})

describe('sitemap.xml', () => {
  const xml = () => read('sitemap.xml')

  test('is a urlset with lastmod on every entry', () => {
    expect(xml()).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    const locs = xml().match(/<loc>/g) ?? []
    const lastmods = xml().match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) ?? []
    expect(locs.length).toBeGreaterThan(20)
    expect(lastmods.length).toBe(locs.length)
  })

  test('covers homepages, blog, posts, tags and trust pages', () => {
    for (const url of [
      'https://franklinjavier.com/',
      'https://franklinjavier.com/pt-br/',
      'https://franklinjavier.com/blog/',
      'https://franklinjavier.com/blog/how-to-be-proactive/',
      'https://franklinjavier.com/blog/tag/react/',
      'https://franklinjavier.com/about/',
      'https://franklinjavier.com/contact/',
      'https://franklinjavier.com/privacy/',
      'https://franklinjavier.com/pt-br/privacy/',
    ]) {
      expect(xml()).toContain(`<loc>${url}</loc>`)
    }
  })
})

describe('robots.txt', () => {
  test('references the sitemap', () => {
    expect(read('robots.txt')).toContain('Sitemap: https://franklinjavier.com/sitemap.xml')
  })
})

describe('404 page', () => {
  test('points agents at recovery links', () => {
    const html = read('404.html')
    expect(html).toContain('href="/sitemap.xml"')
    expect(html).toContain('href="/llms.txt"')
    expect(html).toContain('href="/blog/"')
  })
})

describe('trust pages', () => {
  test('each has at least 500 characters of visible content', () => {
    for (const path of [
      'about/index.html',
      'contact/index.html',
      'privacy/index.html',
      'pt-br/about/index.html',
      'pt-br/contact/index.html',
      'pt-br/privacy/index.html',
    ]) {
      const html = read(path)
      const article = html.match(/<article[^>]*>(.*?)<\/article>/s)?.[1] ?? ''
      const text = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      expect(text.length).toBeGreaterThanOrEqual(500)
    }
  })
})

describe('vercel.json', () => {
  test('sets Vary: Accept and markdown content-type headers', () => {
    const config = JSON.parse(readFileSync(join(import.meta.dir, '..', 'vercel.json'), 'utf-8'))
    const allHeaders = (config.headers as { source: string; headers: { key: string; value: string }[] }[]).flatMap(
      (rule) => rule.headers.map((header) => ({ source: rule.source, ...header })),
    )
    expect(allHeaders).toContainEqual({ source: '/(.*)', key: 'Vary', value: 'Accept' })
    expect(allHeaders).toContainEqual({
      source: '/(.*\\.md)',
      key: 'Content-Type',
      value: 'text/markdown; charset=utf-8',
    })
  })
})
