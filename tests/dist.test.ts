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

function cssHrefs(html: string): string[] {
  return [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((match) => match[1])
}

function cssFor(htmlPath: string): string {
  return cssHrefs(read(htmlPath))
    .map((href) => read(href.replace(/^\//, '')))
    .join('\n')
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

describe('site header', () => {
  const header = (path: string) =>
    read(path).match(/<header class="sticky[^"]*"[^>]*>(.*?)<\/header>/s)?.[0] ?? ''

  test('labels the nav, marks the current item and localizes the switches', () => {
    const en = header('index.html')
    expect(en).toContain('<nav aria-label="Main"')
    expect(en).toMatch(/<a href="\/" aria-current="page"/)
    expect(en).toMatch(/id="language-toggle" href="\/pt-br\/" hreflang="pt-br" lang="pt-br"/)
    expect(en).toContain('aria-label="Mudar para Português"')
    expect(en).toContain('aria-label="Toggle dark mode"')

    const pt = header('pt-br/blog/index.html')
    expect(pt).toContain('<nav aria-label="Principal"')
    expect(pt).toMatch(/<a href="\/pt-br\/blog\/" aria-current="page"/)
    expect(pt).toContain('aria-label="Switch to English"')
    expect(pt).toContain('aria-label="Alternar modo escuro"')
  })

  test('marks Blog as the current section on posts', () => {
    expect(header('blog/how-to-be-proactive/index.html')).toMatch(
      /<a href="\/blog\/" aria-current="true"/,
    )
  })

  test('uses the same container as every page body', () => {
    for (const path of [
      'index.html',
      'blog/index.html',
      'blog/tag/react/index.html',
      'about/index.html',
      'speaking/index.html',
      'blog/how-to-be-proactive/index.html',
    ]) {
      expect(header(path)).toContain('<div class="site-container">')
      expect(read(path)).toMatch(/<(main|div) class="site-container[ "]/)
      expect(read(path)).not.toContain('max-w-2xl')
      expect(read(path)).not.toContain('max-w-[34.5rem]')
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

  test('TOC falls back to the heading text, numbers sections and keeps the full heading', () => {
    // No post on this branch sets `toc` frontmatter labels; tests/toc.test.ts
    // covers the overrides.
    const cases = [
      {
        path: 'blog/old-macbook-context-server/index.html',
        slug: 'the-architecture-roughly',
        heading: 'The architecture, roughly',
      },
      {
        path: 'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
        slug: 'a-arquitetura-por-alto',
        heading: 'A arquitetura, por alto',
      },
    ]
    for (const { path, slug, heading } of cases) {
      const html = read(path)
      const tocs = [...html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)].map((m) => m[1])
      expect(tocs).toHaveLength(2)
      for (const [index, toc] of tocs.entries()) {
        const link = new RegExp(`<a href="#${slug}"[^>]*>(.*?)</a>`, 's').exec(toc)
        expect(link).not.toBeNull()
        // Inline <details> first (title tooltip), then the sidebar (full text on expand).
        if (index === 0) expect(link![0]).toContain(`title="${heading}"`)
        else expect(link![1]).toContain(`class="toc-full sr-only">${heading}</span>`)
        expect(link![1]).toContain(`>${heading}</span>`)
        // Section numbers are decorative: hidden from screen readers.
        expect(toc).toMatch(/<span aria-hidden="true"[^>]*>01<\/span>/)
      }
    }
  })

  test('show the reading time in the meta line in both languages', () => {
    const cases = [
      { path: 'blog/old-macbook-context-server/index.html', label: 'min read' },
      {
        path: 'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
        label: 'min de leitura',
      },
      { path: 'blog/the-great-suspender/index.html', label: 'min read' },
    ]
    for (const { path, label } of cases) {
      const match = new RegExp(`<span data-reading-time>(\\d+) ${label}</span>`).exec(read(path))
      expect(match).not.toBeNull()
      expect(Number(match![1])).toBeGreaterThanOrEqual(1)
    }
  })

  test('ship the sidenote enhancement hook and script', () => {
    for (const path of [
      'blog/old-macbook-context-server/index.html',
      'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
    ]) {
      const html = read(path)
      expect(html).toMatch(/<div class="prose" data-sidenotes>/)
      const scripts = [...html.matchAll(/<script type="module">(.*?)<\/script>/gs)].map((m) => m[1])
      const sidenotes = scripts.find((script) => script.includes('sup > a[data-footnote-ref]'))
      expect(sidenotes).toBeDefined()
      expect(sidenotes).toContain('[data-sidenotes]')
      expect(sidenotes).toContain('(min-width: 64rem)')
    }
  })
})

describe('no web fonts', () => {
  function builtFiles(dir: string, ext: RegExp): string[] {
    return readdirSync(join(DIST, dir), { recursive: true, encoding: 'utf-8' })
      .filter((file) => ext.test(file))
      .map((file) => join(dir, file))
  }

  test('built HTML and CSS load no font files, @font-face or font CDNs', () => {
    const files = [...builtFiles('.', /\.html$/), ...builtFiles('.', /\.css$/)]
    expect(files.some((file) => file.endsWith('.css'))).toBe(true)
    for (const file of files) {
      // Code samples in posts may talk about fonts; only markup and CSS count.
      const text = read(file).replace(/<(pre|code)\b[\s\S]*?<\/\1>/g, '')
      expect(text).not.toContain('@font-face')
      expect(text).not.toMatch(/\.(woff2?|ttf|otf)\b/)
      expect(text).not.toMatch(/fonts\.(googleapis|gstatic)/)
      expect(text).not.toMatch(/<link\b[^>]*rel="preload"[^>]*as="font"/)
      expect(text).not.toMatch(/<link\b[^>]*as="font"[^>]*rel="preload"/)
    }
    expect(existsSync(join(DIST, 'fonts'))).toBe(false)
  })

  test('uses native system stacks', () => {
    const css = cssFor('blog/how-to-be-proactive/index.html')
    expect(css).toMatch(/--font-sans:\s*ui-sans-serif,\s*system-ui/)
    expect(css).toMatch(/--font-serif:\s*ui-serif,\s*["']New York["']/)
    expect(css).toMatch(/--font-mono:\s*ui-monospace,\s*SFMono-Regular/)
  })
})

describe('heading links', () => {
  const posts = [
    'blog/stylex-personal-site/index.html',
    'pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/index.html',
    'blog/old-macbook-context-server/index.html',
    'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
  ]
  const prose = (html: string) =>
    html.match(/<div class="prose" data-sidenotes>([\s\S]*?)<p data-heading-anchor-status/)?.[1] ??
    ''
  // The visually hidden "Footnotes" h2 from GFM is not a section.
  const headingIds = (html: string) =>
    [...prose(html).matchAll(/<h[23]\b[^>]*\sid="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((id) => id !== 'footnote-label')

  test('every prose h2/h3 id is in the TOC and every TOC href is a heading', () => {
    for (const path of posts) {
      const html = read(path)
      const ids = headingIds(html)
      expect(ids.length).toBeGreaterThanOrEqual(2)
      const tocs = [...html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)].map((m) => m[1])
      expect(tocs).toHaveLength(2)
      for (const toc of tocs) {
        const hrefs = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
        expect(hrefs).toEqual(ids)
      }
    }
  })

  const decode = (text: string) =>
    text
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&#x27;', "'")
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&')
  const stripTags = (html: string) => decode(html.replace(/<[^>]+>/g, '')).trim()
  // Heading text as a screen reader gets it, minus the copy-link anchor.
  const headingTexts = (html: string) =>
    [...prose(html).matchAll(/<h([23])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)]
      .filter((m) => m[2] !== 'footnote-label')
      .map((m) => stripTags(m[3].replace(/<a class="heading-anchor"[\s\S]*?<\/a>/g, '')))
  const sidebarToc = (html: string) =>
    /<nav data-toc aria-labelledby="toc-label-sidebar"[^>]*>(.*?)<\/nav>/s.exec(html)?.[1] ?? ''
  const inlineToc = (html: string) =>
    /<nav data-toc aria-label="[^"]+"[^>]*>(.*?)<\/nav>/s.exec(html)?.[1] ?? ''
  const tocLinks = (toc: string) =>
    [...toc.matchAll(/<a href="#[^"]+"([^>]*)>(.*?)<\/a>/gs)].map((m) => ({
      attrs: m[1],
      inner: m[2],
    }))
  // Accessible name from content: aria-hidden subtrees don't count.
  const accessibleName = (inner: string) =>
    stripTags(inner.replace(/<span aria-hidden="true"[^>]*>.*?<\/span>/gs, ''))

  test('the sidebar TOC carries the full heading text for every item, named once', () => {
    for (const path of posts) {
      const html = read(path)
      const headings = headingTexts(html)
      const links = tocLinks(sidebarToc(html))
      expect(links).toHaveLength(headings.length)
      for (const [index, { attrs, inner }] of links.entries()) {
        const full = /<span class="toc-full[^"]*">(.*?)<\/span>/s.exec(inner)
        expect(full).not.toBeNull()
        expect(stripTags(full![1])).toBe(headings[index])
        // The short label is shown while compact but hidden from screen readers.
        expect(inner).toMatch(/<span aria-hidden="true" class="toc-short[^"]*">/)
        // One name, from content only: no aria-label or title to repeat it.
        expect(attrs).not.toContain('aria-label')
        expect(attrs).not.toContain('title=')
        expect(accessibleName(inner)).toBe(headings[index])
      }
    }
  })

  test('the inline (mobile) TOC keeps one truncated label with the heading as title', () => {
    for (const path of posts) {
      const html = read(path)
      const headings = headingTexts(html)
      const links = tocLinks(inlineToc(html))
      expect(links).toHaveLength(headings.length)
      for (const [index, { attrs, inner }] of links.entries()) {
        expect(inner).not.toContain('toc-full')
        expect(inner).not.toContain('toc-short')
        expect(inner.match(/<span class="min-w-0 truncate">/g)).toHaveLength(1)
        expect(decode(/title="([^"]*)"/.exec(attrs)?.[1] ?? '')).toBe(headings[index])
        expect(accessibleName(inner)).toBe(headings[index])
      }
    }
  })

  test('each heading carries a localized copy-link anchor to its own id', () => {
    for (const path of posts) {
      const html = read(path)
      const prefix = path.startsWith('pt-br/') ? 'Copiar link da seção:' : 'Copy link to section:'
      const message = path.startsWith('pt-br/') ? 'Link copiado' : 'Link copied'
      const headings = [
        ...prose(html).matchAll(/<h([23])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g),
      ].filter((m) => m[2] !== 'footnote-label')
      expect(headings.length).toBeGreaterThanOrEqual(2)
      for (const [, , id, inner] of headings) {
        expect(inner).toContain(`<a class="heading-anchor" href="#${id}" aria-label="${prefix} `)
        expect(inner.match(/data-heading-anchor/g)).toHaveLength(1)
      }
      const regions = [...html.matchAll(/<p data-heading-anchor-status[^>]*>/g)]
      expect(regions).toHaveLength(1)
      expect(regions[0][0]).toContain(`data-message="${message}"`)
      expect(regions[0][0]).toContain('data-error-message="')
      expect(regions[0][0]).toContain('aria-live="polite"')
      const scripts = [...html.matchAll(/<script type="module"[^>]*>(.*?)<\/script>/gs)]
        .map((m) => m[1])
        .join('\n')
      const external = [...html.matchAll(/<script type="module" src="([^"]+)"/g)]
        .map((m) => read(m[1].replace(/^\//, '')))
        .join('\n')
      const js = scripts + external
      expect(js).toContain('a[data-heading-anchor]')
      expect(js).toContain('writeText')
      expect(js).toContain('execCommand')
    }
  })

  test('the TOC labels and markdown twins carry no anchor glyph', () => {
    for (const path of posts) {
      const html = read(path)
      for (const toc of html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)) {
        expect(toc[1]).not.toContain('heading-anchor')
        expect(toc[1]).not.toMatch(/#<\/span>/)
      }
      const twin = read(path.replace(/index\.html$/, 'index.md'))
      expect(twin).not.toContain('heading-anchor')
      expect(twin).not.toMatch(/^#{2,3} .*#\s*$/m)
    }
  })
})

describe('post series', () => {
  const labels = {
    en: {
      marker: (part: number, total: number, name: string) => `Part ${part} of ${total} · ${name}`,
      back: (part: number, title: string) => `Part ${part}: ${title}`,
      next: (part: number, title: string) => `Next: Part ${part} · ${title}`,
      nextPrefix: 'Next: Part',
      navLabel: 'Post series',
      nextNavLabel: 'Next part of the series',
    },
    'pt-br': {
      marker: (part: number, total: number, name: string) => `Parte ${part} de ${total} · ${name}`,
      back: (part: number, title: string) => `Parte ${part}: ${title}`,
      next: (part: number, title: string) => `Próximo: Parte ${part} · ${title}`,
      nextPrefix: 'Próximo: Parte',
      navLabel: 'Série de posts',
      nextNavLabel: 'Próxima parte da série',
    },
  }

  function page(url: string): string {
    return read(`${url.slice(1)}index.html`)
  }

  function twin(url: string): string {
    return read(`${url.slice(1)}index.md`)
  }

  function nav(html: string, label: string): string | undefined {
    return new RegExp(`<nav aria-label="${label}"[^>]*>(.*?)</nav>`, 's').exec(html)?.[1]
  }

  function header(md: string): string {
    return md.slice(0, md.indexOf('- Author:'))
  }

  // Totals, neighbours and the last part come from the data, so these keep
  // passing as parts are added.
  for (const [key, series] of Object.entries(SERIES)) {
    const parts = [...series.parts].sort((a, b) => a.part - b.part)
    const total = parts.length
    const first = parts[0]
    const last = parts[total - 1]

    for (const lang of ['en', 'pt-br'] as const) {
      const l = labels[lang]
      const marker = (part: number) => l.marker(part, total, series.name[lang])

      test(`${key} ${lang}: part 1 shows "${marker(1)}" with no link at the top`, () => {
        const top = nav(page(first.posts[lang].url), l.navLabel)
        expect(top).toContain(marker(1))
        expect(top).not.toContain('<a')
        const md = header(twin(first.posts[lang].url))
        expect(md).toContain(marker(1))
        expect(md).not.toContain('](')
      })

      test(`${key} ${lang}: the last part shows "${marker(last.part)}" and has no forward link`, () => {
        const html = page(last.posts[lang].url)
        expect(nav(html, l.navLabel)).toContain(marker(last.part))
        expect(nav(html, l.nextNavLabel)).toBeUndefined()
        expect(html).not.toContain(l.nextPrefix)
        expect(twin(last.posts[lang].url)).not.toContain(l.nextPrefix)
      })

      for (const [i, entry] of parts.entries()) {
        const url = entry.posts[lang].url
        const previous = parts[i - 1]
        const next = parts[i + 1]

        if (previous) {
          test(`${key} ${lang}: part ${entry.part} links back to part ${previous.part}`, () => {
            const back = l.back(previous.part, previous.posts[lang].title)
            const top = nav(page(url), l.navLabel)
            expect(top).toContain(marker(entry.part))
            expect(top).toContain(`href="${previous.posts[lang].url}"`)
            expect(top).toContain(back)
            const md = header(twin(url))
            expect(md).toContain(marker(entry.part))
            expect(md).toContain(`← [${back}](https://`)
            expect(md).toContain(`${previous.posts[lang].url})`)
          })
        }

        if (next) {
          test(`${key} ${lang}: part ${entry.part} ends with a link to part ${entry.part + 1}`, () => {
            expect(next.part).toBe(entry.part + 1)
            const nextLabel = l.next(next.part, next.posts[lang].title)
            const html = page(url)
            const end = nav(html, l.nextNavLabel)
            expect(end).toContain(`href="${next.posts[lang].url}"`)
            expect(end).toContain(nextLabel)
            const at = html.indexOf(`aria-label="${l.nextNavLabel}"`)
            expect(at).toBeGreaterThan(html.indexOf('class="prose"'))
            expect(at).toBeLessThan(html.indexOf('</article>'))
            const md = twin(url)
            const line = `[${nextLabel}](https://`
            expect(md).toContain(line)
            expect(md).toContain(`${next.posts[lang].url})`)
            expect(md.indexOf(line)).toBeGreaterThan(md.indexOf('- Canonical:'))
          })
        }
      }
    }
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
    expect(markdownAlternates(read('blog/old-macbook-context-server/index.html'))).toEqual([
      'https://franklinjavier.com/blog/old-macbook-context-server/index.md',
    ])
    expect(
      markdownAlternates(read('pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html')),
    ).toEqual([
      'https://franklinjavier.com/pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.md',
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

describe('accessibility guards', () => {
  const post = 'blog/stylex-personal-site/index.html'

  test('selected text is ink on the selection colour', () => {
    expect(cssFor('index.html')).toMatch(
      /::selection\{background-color:var\(--selection\);color:var\(--ink\)\}/,
    )
  })

  test('bare markdown tables scroll inside themselves on phones', () => {
    // This post ships a GFM table with no .overflow-x-auto wrapper.
    expect(read(post)).toMatch(/<\/p>\s*<table>/)
    expect(cssFor(post)).toMatch(
      /table:not\(\.overflow-x-auto ?> ?table\)\)\{[^}]*max-width:100%[^}]*display:block[^}]*overflow-x:auto/,
    )
  })

  test('translucent Shiki comments are forced opaque', () => {
    expect(read('blog/loading-disqus-at-page-end/index.html')).toContain('color:#8B8B8B94')
    expect(cssFor('blog/loading-disqus-at-page-end/index.html')).toMatch(
      /8B8B8B94 i\]\)\{color:#8b8b8b!important\}/,
    )
  })

  test('theme transition and 404 glitch opt out of reduced motion', () => {
    const html = read('index.html')
    expect(html).toContain(
      "startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches",
    )
    expect(cssFor('index.html')).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{::view-transition-old\(root\),::view-transition-new\(root\)\{animation:none\}/,
    )
    expect(cssFor('404.html')).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.glitch[^{]*\{animation:none\}/,
    )
  })

  test('the 404 glitch stops on its own within five seconds', () => {
    expect(cssFor('404.html')).toMatch(/\.glitch[^{]*\{animation:1s linear 4 glitch\}/)
  })

  test('footnote text on well backgrounds is never muted', () => {
    const css = cssFor(post)
    expect(css).toMatch(/th sup>a\[data-footnote-ref\]\)\{color:var\(--ink-2\)\}/)
    expect(css).toMatch(/\.sidenote a code\)\{color:var\(--ink-2\)\}/)
  })

  test('theme toggle is labelled in the page language', () => {
    expect(read('index.html')).toContain('aria-label="Toggle dark mode"')
    expect(read('pt-br/index.html')).toContain('aria-label="Alternar modo escuro"')
  })

  test('home lists recent posts as headings with their descriptions', () => {
    const section = /<section[^>]*id="posts"[^>]*>(.*?)<\/section>/s.exec(read('index.html'))![1]
    expect((section.match(/<h3\b/g) ?? []).length).toBe(6)
    expect(section).toMatch(/<\/h3>.*?<\/time>\s*<\/div>\s*<p\b/s)
  })
})
