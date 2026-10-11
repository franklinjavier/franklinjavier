// Assertions against the built site in dist/. Run `bun run build` first
// (the `bun test` script in package.json does this for you via `bun run check`).
import { beforeAll, describe, expect, test } from 'bun:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import { SERIES } from '../src/data/series'

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

  test('Person graph carries the disambiguation fields', () => {
    const graphBlock = jsonLdBlocks(html()).find((block) => '@graph' in block)
    const graph = (graphBlock as { '@graph': Record<string, unknown>[] })['@graph']
    const person = graph.find((node) => node['@type'] === 'Person')
    expect(person?.worksFor).toMatchObject({ name: 'Stone Giant Studio' })
    expect(person?.alumniOf).toContainEqual({ '@type': 'Organization', name: 'Beleza na Web' })
    expect(person?.knowsAbout).toContain('Web performance')
    expect(person?.sameAs).toContain('https://x.com/franklinjavier')
    expect(person?.sameAs).toContain('https://www.linkedin.com/in/franklin-javier-98504321')
    expect(person?.sameAs).toContain('https://dev.to/franklinjavier')
  })

  test('attributes X cards to the author with a large image', () => {
    expect(html()).toContain('name="twitter:card" content="summary_large_image"')
    expect(html()).toContain('name="twitter:creator" content="@franklinjavier"')
  })
})

describe('speaking page', () => {
  test('lists each appearance with its source link in both languages', () => {
    for (const path of ['speaking/index.html', 'pt-br/speaking/index.html']) {
      const html = read(path)
      expect(html).toContain(
        'https://www.hipsters.tech/performance-e-otimizacoes-na-web-hipsters-114/',
      )
      expect(html).toContain('https://www.youtube.com/watch?v=ad7e9TuQs1s')
      expect(html).toContain('Sérgio Lopes')
    }
  })

  test('has ItemList JSON-LD whose items credit the Person', () => {
    const list = jsonLdBlocks(read('speaking/index.html')).find(
      (block) => block['@type'] === 'ItemList',
    )
    expect(list).toBeDefined()
    const items = list?.itemListElement as { item: Record<string, unknown> }[]
    expect(items.length).toBeGreaterThan(0)
    for (const entry of items) {
      expect(entry.item.url).toBeTruthy()
      expect(entry.item.contributor).toMatchObject({
        '@id': 'https://franklinjavier.com/#person',
      })
    }
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

  test('render a localized table of contents when the post has headings', () => {
    const cases = [
      { path: 'blog/stylex-personal-site/index.html', label: 'On this page' },
      { path: 'pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/index.html', label: 'Nesta página' },
    ]
    for (const { path, label } of cases) {
      const html = read(path)
      const tocs = [...html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)].map((m) => m[0])
      // Sidebar (lg+) and collapsed <details> (mobile) variants.
      expect(tocs).toHaveLength(2)
      expect(html).toContain(`>${label}</p>`)
      expect(html).toContain(`aria-label="${label}"`)
      for (const toc of tocs) {
        const ids = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
        expect(ids.length).toBeGreaterThanOrEqual(2)
        for (const id of ids) expect(html).toContain(`id="${id}"`)
      }
    }
  })

  test('render no table of contents when the post has no headings', () => {
    const html = read('blog/the-great-suspender/index.html')
    expect(html).not.toContain('data-toc')
    expect(html).not.toContain('<aside')
    expect(html).not.toContain('lg:grid-cols-')
  })

  test('TOC uses short frontmatter labels, numbers sections and keeps the full heading as title', () => {
    const cases = [
      {
        path: 'blog/how-always-on-agents-work/index.html',
        slug: 'a-retry-must-not-charge-you-again',
        heading: 'A retry must not charge you again',
        label: 'Safe retries',
      },
      {
        path: 'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html',
        slug: 'cache-o-detalhe-que-define-o-custo',
        heading: 'Cache: o detalhe que define o custo',
        label: 'Cache do prompt',
      },
    ]
    for (const { path, slug, heading, label } of cases) {
      const html = read(path)
      const tocs = [...html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)].map((m) => m[1])
      expect(tocs).toHaveLength(2)
      for (const toc of tocs) {
        const link = new RegExp(`<a href="#${slug}"[^>]*>(.*?)</a>`, 's').exec(toc)
        expect(link).not.toBeNull()
        expect(link![0]).toContain(`title="${heading}"`)
        expect(link![1]).toContain(`>${label}</span>`)
        expect(link![1]).not.toContain(heading)
        // Section numbers are decorative: hidden from screen readers.
        expect(toc).toMatch(/<span aria-hidden="true"[^>]*>01<\/span>/)
      }
    }
  })
})

describe('post series', () => {
  const cases = [
    {
      lang: 'en',
      part1: '/blog/old-macbook-context-server/',
      part2: '/blog/how-always-on-agents-work/',
      marker: (n: number) => `Part ${n} of 2 · experiments with agents`,
      backLink: 'Part 1: My old MacBook is now a context server',
      nextLink: 'Next: Part 2 · How an agent loop works',
      nextPrefix: 'Next: Part',
      navLabel: 'Post series',
      nextNavLabel: 'Next part of the series',
    },
    {
      lang: 'pt-br',
      part1: '/pt-br/blog/macbook-velho-virou-servidor-de-contexto/',
      part2: '/pt-br/blog/como-funciona-um-agente-sempre-ligado/',
      marker: (n: number) => `Parte ${n} de 2 · experimentos com agentes`,
      backLink: 'Parte 1: MacBook velho virou servidor de contexto',
      nextLink: 'Próximo: Parte 2 · Como funciona um agente em loop',
      nextPrefix: 'Próximo: Parte',
      navLabel: 'Série de posts',
      nextNavLabel: 'Próxima parte da série',
    },
  ]

  function page(url: string): string {
    return read(`${url.slice(1)}index.html`)
  }

  function twin(url: string): string {
    return read(`${url.slice(1)}index.md`)
  }

  function nav(html: string, label: string): string | undefined {
    return new RegExp(`<nav aria-label="${label}"[^>]*>(.*?)</nav>`, 's').exec(html)?.[1]
  }

  for (const c of cases) {
    test(`${c.lang}: part 1 shows "${c.marker(1)}" with no link at the top`, () => {
      const top = nav(page(c.part1), c.navLabel)
      expect(top).toContain(c.marker(1))
      expect(top).not.toContain('<a')
    })

    test(`${c.lang}: part 2 shows "${c.marker(2)}" and links back to part 1`, () => {
      const top = nav(page(c.part2), c.navLabel)
      expect(top).toContain(c.marker(2))
      expect(top).toContain(`href="${c.part1}"`)
      expect(top).toContain(c.backLink)
    })

    test(`${c.lang}: part 1 ends with "${c.nextLink}" after the body`, () => {
      const html = page(c.part1)
      const end = nav(html, c.nextNavLabel)
      expect(end).toContain(`href="${c.part2}"`)
      expect(end).toContain(c.nextLink)
      const at = html.indexOf(`aria-label="${c.nextNavLabel}"`)
      expect(at).toBeGreaterThan(html.indexOf('class="prose"'))
      expect(at).toBeLessThan(html.indexOf('</article>'))
    })

    test(`${c.lang}: the last part has no forward link`, () => {
      const html = page(c.part2)
      expect(nav(html, c.nextNavLabel)).toBeUndefined()
      expect(html).not.toContain(c.nextPrefix)
    })

    test(`${c.lang}: markdown twins carry the marker, back link and next line`, () => {
      const part1 = twin(c.part1)
      const part2 = twin(c.part2)
      const header = (md: string) => md.slice(0, md.indexOf('- Author:'))
      expect(header(part1)).toContain(c.marker(1))
      expect(header(part1)).not.toContain('](')
      expect(header(part2)).toContain(c.marker(2))
      expect(header(part2)).toContain(`← [${c.backLink}](https://`)
      expect(header(part2)).toContain(`${c.part1})`)
      const next = `[${c.nextLink}](https://`
      expect(part1).toContain(next)
      expect(part1).toContain(`${c.part2})`)
      expect(part1.indexOf(next)).toBeGreaterThan(part1.indexOf('- Canonical:'))
      expect(part2).not.toContain(c.nextPrefix)
    })
  }

  test('every series part in the data matches a built post (title, URL, language, part)', () => {
    for (const series of Object.values(SERIES)) {
      for (const entry of series.parts) {
        for (const lang of ['en', 'pt-br'] as const) {
          const post = entry.posts[lang]
          const html = page(post.url)
          const pt = lang === 'pt-br'
          expect(html).toContain(`<html lang="${pt ? 'pt-BR' : 'en'}"`)
          expect(/<h1[^>]*>(.*?)<\/h1>/s.exec(html)?.[1]).toBe(post.title)
          const marker = `${pt ? 'Parte' : 'Part'} ${entry.part} ${pt ? 'de' : 'of'} ${series.parts.length} · ${series.name[lang]}`
          expect(nav(html, pt ? 'Série de posts' : 'Post series')).toContain(marker)
        }
      }
    }
  })

  test('every built post with a series marker is listed in the series data', () => {
    const listed = Object.values(SERIES).flatMap((series) =>
      series.parts.flatMap((entry) => [entry.posts.en.url, entry.posts['pt-br'].url]),
    )
    const marked: string[] = []
    for (const base of ['blog', 'pt-br/blog']) {
      for (const slug of readdirSync(join(DIST, base))) {
        const file = join(DIST, base, slug, 'index.html')
        if (!existsSync(file)) continue
        if (/<nav aria-label="(Post series|Série de posts)"/.test(readFileSync(file, 'utf-8'))) {
          marked.push(`/${base}/${slug}/`)
        }
      }
    }
    expect(marked.sort()).toEqual(listed.sort())
  })

  test('posts outside a series have no series nav', () => {
    const html = read('blog/the-great-suspender/index.html')
    expect(html).not.toContain('aria-label="Post series"')
    expect(html).not.toContain('aria-label="Next part of the series"')
  })
})

describe('markdown alternate link', () => {
  function markdownAlternates(html: string): string[] {
    const hrefs: string[] = []
    for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
      const attrs = Object.fromEntries(
        [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
      )
      if (attrs.rel === 'alternate' && attrs.type === 'text/markdown') hrefs.push(attrs.href)
    }
    return hrefs
  }

  test('post HTML links its markdown twin via rel=alternate', () => {
    expect(markdownAlternates(read('blog/how-always-on-agents-work/index.html'))).toEqual([
      'https://franklinjavier.com/blog/how-always-on-agents-work/index.md',
    ])
    expect(
      markdownAlternates(read('pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html')),
    ).toEqual([
      'https://franklinjavier.com/pt-br/blog/como-funciona-um-agente-sempre-ligado/index.md',
    ])
    expect(markdownAlternates(read('404.html'))).toEqual([])
  })

  test('is present on exactly the HTML pages that have a markdown twin', () => {
    const files = (readdirSync(DIST, { recursive: true }) as string[]).map((f) =>
      f.split(sep).join('/'),
    )
    const twins = new Set(files.filter((f) => f === 'index.md' || f.endsWith('/index.md')))
    const pages = files.filter((f) => f.endsWith('.html'))
    expect(twins.size).toBeGreaterThan(10)
    for (const page of pages) {
      const twin = page.replace(/index\.html$/, 'index.md')
      const expected = twins.has(twin) ? [encodeURI(`https://franklinjavier.com/${twin}`)] : []
      expect({ page, links: markdownAlternates(read(page)) }).toEqual({ page, links: expected })
    }
    for (const twin of twins) expect(pages).toContain(twin.replace(/index\.md$/, 'index.html'))
  })
})

describe('inline diagrams', () => {
  const posts = [
    {
      lang: 'en',
      html: 'blog/how-always-on-agents-work/index.html',
      md: 'blog/how-always-on-agents-work/index.md',
      credit: 'source: Lee Robinson, CS146S',
      described: '*Diagram: ',
    },
    {
      lang: 'pt-br',
      html: 'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html',
      md: 'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.md',
      credit: 'fonte: Lee Robinson, CS146S',
      described: '*Diagrama: ',
    },
  ]

  test('the always-on post renders seven accessible SVG figures per language', () => {
    for (const post of posts) {
      const html = read(post.html)
      const figures = [...html.matchAll(/<figure class="diagram"[^>]*>(.*?)<\/figure>/gs)].map(
        (m) => m[1],
      )
      expect(figures).toHaveLength(7)
      for (const figure of figures) {
        const svg = /<svg [^>]*>/.exec(figure)?.[0] ?? ''
        expect(svg).toContain('role="img"')
        const [titleId, descId] = /aria-labelledby="([^"]+)"/.exec(svg)?.[1].split(' ') ?? []
        expect(titleId).toStartWith('dg-')
        expect(titleId).toContain(`-${post.lang}-`)
        // <title> is the first child, then <desc>.
        expect(figure).toContain(`${svg}<title id="${titleId}">`)
        expect(figure).toContain(`<desc id="${descId}">`)
        expect(figure).toContain(`<figcaption>`)
        expect(figure).toContain(post.credit)
      }
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
      expect(new Set(ids).size).toBe(ids.length)
      expect(html).not.toContain('<figure data-diagram=')
      // The TOC still renders both variants.
      expect([...html.matchAll(/<nav data-toc/g)]).toHaveLength(2)
    }
  })

  test('the markdown twin describes each diagram instead of leaking placeholders', () => {
    for (const post of posts) {
      const md = read(post.md)
      expect(md).not.toContain('<figure')
      expect(md.split(post.described)).toHaveLength(8)
    }
  })

  test('other posts are unaffected', () => {
    for (const path of ['blog/how-to-be-proactive/index.html', 'blog/lisbon-ai-2026/index.html']) {
      expect(read(path)).not.toContain('class="diagram"')
    }
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
      'speaking/index.md',
      'pt-br/speaking/index.md',
      'about/index.md',
      'contact/index.md',
      'privacy/index.md',
      'pt-br/about/index.md',
      'pt-br/contact/index.md',
      'pt-br/privacy/index.md',
      'cv/index.md',
      'pt-br/cv/index.md',
    ]
    for (const path of paths) {
      expect(existsSync(join(DIST, path))).toBe(true)
    }
  })

  test('post markdown carries title, canonical URL and raw markdown body', () => {
    const md = read('blog/how-to-be-proactive/index.md')
    expect(md).toMatch(/^# /)
    expect(md).toContain('- Canonical: https://franklinjavier.com/blog/how-to-be-proactive/')
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
    expect(txt()).toContain('https://franklinjavier.com/speaking/')
    expect(txt()).toContain('https://franklinjavier.com/contact/')
    expect(txt()).toContain('https://franklinjavier.com/sitemap.xml')
    expect(txt()).toContain('https://franklinjavier.com/rss.xml')
  })

  test('lists blog posts in both languages', () => {
    expect(txt()).toContain('## Blog posts (English)')
    expect(txt()).toContain('## Blog posts (Português)')
    expect(txt()).toContain('https://franklinjavier.com/blog/how-to-be-proactive/')
    expect(txt()).toContain('https://franklinjavier.com/pt-br/blog/como-ser-pessoa-propositiva/')
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
      'https://franklinjavier.com/speaking/',
      'https://franklinjavier.com/pt-br/speaking/',
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

  test('declares AI content usage preferences via Content Signals', () => {
    const txt = read('robots.txt')
    const contentSignal = txt.match(/^Content-Signal: (.*)$/m)?.[1] ?? ''
    expect(contentSignal).toContain('search=yes')
    expect(contentSignal).toContain('ai-input=yes')
    expect(contentSignal).toMatch(/ai-train=(yes|no)/)
    const groupLines = txt.split('\n\n')[0]
    expect(groupLines).toContain('User-agent: *')
    expect(groupLines).toContain('Content-Signal:')
  })
})

describe('unregistered leftovers', () => {
  test('does not ship the unused service worker or PWA manifest', () => {
    expect(existsSync(join(DIST, 'sw.js'))).toBe(false)
    expect(existsSync(join(DIST, 'manifest.json'))).toBe(false)
  })
})

describe('payload cuts', () => {
  function cssHrefs(html: string): string[] {
    return [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((match) => match[1])
  }

  function cssFor(htmlPath: string): string {
    return cssHrefs(read(htmlPath))
      .map((href) => read(href.replace(/^\//, '')))
      .join('\n')
  }

  test('home, blog index, speaking and 404 do not download .prose', () => {
    for (const path of ['index.html', 'blog/index.html', 'speaking/index.html', '404.html']) {
      expect(cssFor(path)).not.toContain('.prose')
    }
  })

  test('about and a fenced post download the thin prose sheet', () => {
    for (const path of ['about/index.html', 'blog/avoid-prop-drilling-react/index.html']) {
      const css = cssFor(path)
      expect(css).toContain('.prose')
      expect(css).not.toMatch(/\.prose-lg\b/)
      expect(css).not.toContain('blockquote')
      expect(css).not.toContain('::file-selector-button')
    }
  })

  test('only emits Vercel Analytics client JS', () => {
    const html = read('index.html')
    expect(html).not.toMatch(/_astro\/[^"]+\.js/)

    const moduleScripts = [...html.matchAll(/<script type="module">(.*?)<\/script>/gs)].map(
      (match) => match[1],
    )

    expect(moduleScripts).toHaveLength(1)
    expect(moduleScripts[0]).toContain('vercel-analytics')
    expect(moduleScripts[0]).toContain('@vercel/analytics')
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
      'cv/index.html',
      'pt-br/cv/index.html',
    ]) {
      const html = read(path)
      const article = html.match(/<article[^>]*>(.*?)<\/article>/s)?.[1] ?? ''
      const text = article
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      expect(text.length).toBeGreaterThanOrEqual(500)
    }
  })
})

describe('vercel.json', () => {
  test('sets Vary: Accept and markdown content-type headers', () => {
    const config = JSON.parse(readFileSync(join(import.meta.dir, '..', 'vercel.json'), 'utf-8'))
    const allHeaders = (
      config.headers as { source: string; headers: { key: string; value: string }[] }[]
    ).flatMap((rule) => rule.headers.map((header) => ({ source: rule.source, ...header })))
    expect(allHeaders).toContainEqual({ source: '/(.*)', key: 'Vary', value: 'Accept' })
    expect(allHeaders).toContainEqual({
      source: '/(.*\\.md)',
      key: 'Content-Type',
      value: 'text/markdown; charset=utf-8',
    })
  })

  test('sets RFC 8288 Link discovery headers on both homepages', () => {
    const config = JSON.parse(readFileSync(join(import.meta.dir, '..', 'vercel.json'), 'utf-8'))
    const linkRules = (
      config.headers as { source: string; headers: { key: string; value: string }[] }[]
    ).filter((rule) => rule.headers.some((header) => header.key === 'Link'))
    const sources = linkRules.map((rule) => rule.source)
    expect(sources).toContain('/')
    expect(sources.some((source) => source.startsWith('/pt-br'))).toBe(true)
    for (const rule of linkRules) {
      const value = rule.headers.find((header) => header.key === 'Link')?.value ?? ''
      expect(value).toContain('</llms.txt>; rel="describedby"')
      expect(value).toContain('</rss.xml>; rel="alternate"')
      expect(value).toContain('</sitemap.xml>; rel="sitemap"')
    }
  })
})
