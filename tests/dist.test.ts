// Assertions against the built site in dist/. Run `bun run build` first
// (the `bun test` script in package.json does this for you via `bun run check`).
import { beforeAll, describe, expect, test } from 'bun:test'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { Window } from 'happy-dom'
import { SERIES } from '../src/data/series'
import middleware from '../middleware'
import { isPostPath, POST_SLUG_PATTERN } from '../src/lib/negotiation'

import { DIST, read, htmlPages } from './dist-helpers'

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

// The table of contents ships once, inside the inline (mobile) <details>;
// the sidebar nav only has an empty rail that its script fills with a copy.
function inlineToc(html: string): string {
  return (
    /<details data-toc-inline[^>]*>.*?<nav data-toc aria-label="[^"]+"[^>]*>(.*?)<\/nav>/s.exec(
      html,
    )?.[1] ?? ''
  )
}

function sidebarToc(html: string): string {
  return (
    /<nav data-toc aria-labelledby="toc-label-sidebar"[^>]*>(.*?)<\/nav>/s.exec(html)?.[1] ?? ''
  )
}

function decodeEntities(text: string): string {
  return text.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&')
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
    // Label in name (WCAG 2.5.3): no aria-label, the name starts with the visible code.
    expect(en).toMatch(
      /id="language-toggle"[^>]*>PT<span class="sr-only">, Mudar para Português<\/span><\/a>/,
    )
    expect(en).not.toMatch(/id="language-toggle"[^>]*aria-label/)
    expect(en).toContain('aria-label="Toggle dark mode"')

    const pt = header('pt-br/blog/index.html')
    expect(pt).toContain('<nav aria-label="Principal"')
    expect(pt).toMatch(/<a href="\/pt-br\/blog\/" aria-current="page"/)
    expect(pt).toMatch(
      /id="language-toggle"[^>]*>EN<span class="sr-only">, Switch to English<\/span><\/a>/,
    )
    expect(pt).not.toMatch(/id="language-toggle"[^>]*aria-label/)
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
      // Sidebar (lg+, filled by JS) and collapsed <details> (mobile) navs;
      // only the <details> ships the list.
      const tocs = [...html.matchAll(/<nav data-toc[^>]*>(.*?)<\/nav>/gs)].map((m) => m[0])
      expect(tocs).toHaveLength(2)
      expect(html).toContain(`>${label}</p>`)
      expect(html).toContain(`aria-label="${label}"`)
      const ids = [...inlineToc(html).matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
      expect(ids.length).toBeGreaterThanOrEqual(2)
      for (const id of ids) expect(html).toContain(`id="${id}"`)
    }
  })

  test('render no table of contents when the post has no headings', () => {
    const html = read('blog/the-great-suspender/index.html')
    expect(html).not.toContain('data-toc')
    expect(html).not.toContain('<aside')
    expect(html).not.toContain('lg:grid-cols-')
  })

  test('TOC falls back to the heading text, numbers sections and keeps the full heading', () => {
    // These posts set no `toc` frontmatter labels (see the custom-label test).
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
      const toc = inlineToc(read(path))
      const link = new RegExp(`<a href="#${slug}"[^>]*>(.*?)</a>`, 's').exec(toc)
      expect(link).not.toBeNull()
      // Tooltip for the truncated inline label (the rail copy drops it).
      expect(link![0]).toContain(`title="${heading}"`)
      // No short label: the full heading is the visible (truncated) label.
      expect(link![1]).toContain(`class="toc-full min-w-0 truncate">${heading}</span>`)
      expect(link![1]).not.toContain('toc-short')
      // Section numbers are decorative: hidden from screen readers.
      expect(toc).toMatch(/<span aria-hidden="true"[^>]*>01<\/span>/)
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
    'blog/how-always-on-agents-work/index.html',
    'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html',
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
      const hrefs = [...inlineToc(html).matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
      expect(hrefs).toEqual(ids)
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
  const tocLinks = (toc: string) =>
    [...toc.matchAll(/<a href="#[^"]+"([^>]*)>(.*?)<\/a>/gs)].map((m) => ({
      attrs: m[1],
      inner: m[2],
    }))
  // Accessible name from content: aria-hidden subtrees don't count.
  const accessibleName = (inner: string) =>
    stripTags(inner.replace(/<span aria-hidden="true"[^>]*>.*?<\/span>/gs, ''))

  test('the TOC names every link once with the full heading text', () => {
    for (const path of posts) {
      const html = read(path)
      const headings = headingTexts(html)
      const links = tocLinks(inlineToc(html))
      expect(links).toHaveLength(headings.length)
      for (const [index, { attrs, inner }] of links.entries()) {
        const full = /<span class="toc-full[^"]*">(.*?)<\/span>/s.exec(inner)
        expect(full).not.toBeNull()
        expect(stripTags(full![1])).toBe(headings[index])
        // One name, from content only; the title only repeats it as a tooltip.
        expect(attrs).not.toContain('aria-label')
        expect(decode(/title="([^"]*)"/.exec(attrs)?.[1] ?? '')).toBe(headings[index])
        // A short label, when there is one, is visible and starts the name.
        const short = /<span class="toc-short[^"]*">(.*?)<\/span>/s.exec(inner)
        expect(accessibleName(inner)).toBe(
          short ? `${stripTags(short[1])}: ${headings[index]}` : headings[index],
        )
      }
    }
  })

  test('custom TOC labels are visible and start the link name (label in name)', () => {
    const path = 'blog/how-always-on-agents-work/index.html'
    const links = tocLinks(inlineToc(read(path)))
    const link = links.find(({ inner }) => inner.includes('>Safe retries<'))
    expect(link).toBeDefined()
    expect(link!.inner).toMatch(/<span class="toc-short[^"]*">Safe retries<\/span>/)
    expect(link!.inner).not.toMatch(/aria-hidden="true"[^>]*class="toc-(short|full)/)
    expect(accessibleName(link!.inner)).toBe('Safe retries: A retry must not charge you again')
    expect(links.filter(({ inner }) => inner.includes('toc-short')).length).toBeGreaterThan(1)
  })

  test('the list ships once: the sidebar rail is an empty slot', () => {
    for (const path of posts) {
      const html = read(path)
      expect(html.match(/class="toc-link /g)?.length).toBe(headingTexts(html).length)
      expect(sidebarToc(html)).toMatch(/<div data-toc-rail[^>]*><\/div>/)
      expect(sidebarToc(html)).not.toContain('<ol')
      // Without JS the rail stays empty, so the <details> shows on lg+ too.
      expect(html).toMatch(
        /<head>.*<noscript><style>[^<]*\[data-toc-inline\][^<]*display: block[^<]*<\/style><\/noscript>.*<\/head>/s,
      )
    }
  })

  test('the sidebar script copies the list into the rail without tooltips', async () => {
    const path = 'blog/old-macbook-context-server/index.html'
    const html = read(path)
    const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1])
      .find((code) => code.includes('[data-toc-rail]'))
    expect(script).toBeDefined()
    const window = new Window({
      url: `https://franklinjavier.com/${path.replace('index.html', '')}`,
    })
    const document = window.document
    document.write(html.replace(/<script\b[\s\S]*?<\/script>/g, ''))
    // happy-dom 20 dropped window.eval, and under Bun its window leaves JS builtins such as
    // decodeURIComponent undefined, so fill those in and run the script with the window as its scope.
    for (const name of Object.getOwnPropertyNames(globalThis)) {
      if (name in window && (window as any)[name] === undefined)
        (window as any)[name] = (globalThis as any)[name]
    }
    new Function('window', `with (window) {\n${script}\n}`)(window)
    const inline = [...document.querySelectorAll('[data-toc-inline] a')]
    const rail = [...document.querySelectorAll('[data-toc-rail] a')]
    expect(rail).toHaveLength(headingTexts(html).length)
    expect(rail.map((a) => a.getAttribute('href'))).toEqual(
      inline.map((a) => a.getAttribute('href')),
    )
    expect(rail.every((a) => !a.hasAttribute('title'))).toBe(true)
    expect(inline.every((a) => a.hasAttribute('title'))).toBe(true)
    // Scroll-spy marks the same section in both copies.
    rail[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    const current = [...document.querySelectorAll('a[aria-current="location"]')]
    expect(current.map((a) => a.getAttribute('href'))).toEqual([
      inline[1].getAttribute('href'),
      rail[1].getAttribute('href'),
    ])
    await window.happyDOM.close()
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

  test('every built post slug gets the middleware Link header', () => {
    let count = 0
    for (const base of ['blog', 'pt-br/blog']) {
      for (const entry of readdirSync(join(DIST, base), { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === 'tag') continue
        const path = `/${base}/${entry.name}/`
        expect({ path, slug: POST_SLUG_PATTERN.test(entry.name) }).toEqual({ path, slug: true })
        expect({ path, post: isPostPath(path) }).toEqual({ path, post: true })
        count++
      }
    }
    expect(count).toBeGreaterThan(10)
  })

  for (const path of [
    '/blog/how-always-on-agents-work/',
    '/pt-br/blog/como-funciona-um-agente-sempre-ligado/',
  ]) {
    test(`middleware Link header on ${path} matches the HTML alternate`, async () => {
      const [href] = markdownAlternates(read(`${path.slice(1)}index.html`))
      expect(href).toBeDefined()
      const response = await middleware(
        new Request(`https://franklinjavier.com${path}`, {
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        }),
      )
      const linkUrl = /^<([^>]+)>/.exec(response.headers.get('link') ?? '')?.[1]
      expect(linkUrl).toBe(href)
      expect(existsSync(join(DIST, new URL(href).pathname))).toBe(true)
    })
  }
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

  test('is a urlset with the xhtml namespace for hreflang alternates', () => {
    expect(xml()).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    )
    const locs = xml().match(/<loc>/g) ?? []
    expect(locs.length).toBeGreaterThan(20)
    // lastmod, when present, is a plain date.
    expect(xml().match(/<lastmod>[^<]*<\/lastmod>/g)?.length).toBe(
      xml().match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)?.length,
    )
  })

  test('covers homepages, blog, posts and trust pages', () => {
    for (const url of [
      'https://franklinjavier.com/',
      'https://franklinjavier.com/pt-br/',
      'https://franklinjavier.com/blog/',
      'https://franklinjavier.com/blog/how-to-be-proactive/',
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

// Sitemap entries keyed by <loc>.
function sitemapEntries(): Map<string, { lastmod?: string; alternates: Record<string, string> }> {
  const entries = new Map<string, { lastmod?: string; alternates: Record<string, string> }>()
  for (const [, body] of read('sitemap.xml').matchAll(/<url>(.*?)<\/url>/gs)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(body)![1]
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(body)?.[1]
    const alternates: Record<string, string> = {}
    for (const [, lang, href] of body.matchAll(
      /<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g,
    )) {
      alternates[lang] = href
    }
    entries.set(loc, { lastmod, alternates })
  }
  return entries
}

function distPathFor(url: string): string {
  return `${new URL(url).pathname.replace(/^\//, '')}index.html`
}

function hreflangs(html: string): Record<string, string> {
  const links: Record<string, string> = {}
  for (const [, lang, href] of html.matchAll(
    /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g,
  )) {
    links[lang] = href
  }
  return links
}

describe('hreflang', () => {
  test('translated pages carry absolute, reciprocal en / pt-BR / x-default alternates', () => {
    let checked = 0
    for (const path of htmlPages()) {
      const html = read(path)
      const links = hreflangs(html)
      if (Object.keys(links).length === 0) continue
      checked++
      expect(Object.keys(links).sort()).toEqual(['en', 'pt-BR', 'x-default'])
      expect(links['x-default']).toBe(links.en)
      const self = /<link rel="canonical" href="([^"]+)">/.exec(html)![1]
      const lang = /<html lang="([^"]+)"/.exec(html)![1]
      expect(links[lang === 'pt-BR' ? 'pt-BR' : 'en']).toBe(self)
      for (const href of Object.values(links)) {
        expect(href.startsWith('https://franklinjavier.com/')).toBe(true)
        expect(existsSync(join(DIST, distPathFor(href)))).toBe(true)
        // The target points back with the same set.
        expect(hreflangs(read(distPathFor(href)))).toEqual(links)
      }
    }
    expect(checked).toBeGreaterThan(40)
  })

  test('covers posts, homes, blog indexes, speaking, CV and trust pages', () => {
    for (const path of [
      'index.html',
      'pt-br/index.html',
      'blog/index.html',
      'speaking/index.html',
      'cv/index.html',
      'about/index.html',
      'privacy/index.html',
      'pt-br/contact/index.html',
      'blog/lisbon-ai-2026/index.html',
      'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
    ]) {
      expect(Object.keys(hreflangs(read(path)))).toHaveLength(3)
    }
    expect(hreflangs(read('pt-br/blog/lisbon-ai-2026/index.html'))).toEqual({
      en: 'https://franklinjavier.com/blog/lisbon-ai-2026/',
      'pt-BR': 'https://franklinjavier.com/pt-br/blog/lisbon-ai-2026/',
      'x-default': 'https://franklinjavier.com/blog/lisbon-ai-2026/',
    })
  })

  test('pages without a translation emit none', () => {
    expect(hreflangs(read('404.html'))).toEqual({})
    expect(hreflangs(read('blog/tag/react/index.html'))).toEqual({})
  })

  test('sitemap entries mirror the page head alternates', () => {
    let withAlternates = 0
    for (const [loc, entry] of sitemapEntries()) {
      const head = hreflangs(read(distPathFor(loc)))
      expect(entry.alternates).toEqual(head)
      if (Object.keys(head).length > 0) withAlternates++
    }
    expect(withAlternates).toBeGreaterThan(40)
  })
})

describe('tag pages', () => {
  const tagPages = () => htmlPages().filter((path) => /(^|\/)blog\/tag\//.test(path))

  test('are noindex,follow in both languages', () => {
    const pages = tagPages()
    expect(pages.some((path) => path.startsWith('pt-br/'))).toBe(true)
    expect(pages.some((path) => path.startsWith('blog/'))).toBe(true)
    for (const path of pages) {
      expect(read(path)).toContain('<meta name="robots" content="noindex,follow">')
    }
  })

  test('are left out of the sitemap, and nothing else is noindex', () => {
    expect(read('sitemap.xml')).not.toContain('/tag/')
    for (const path of htmlPages().filter((path) => !path.includes('/tag/'))) {
      expect(read(path)).not.toContain('name="robots"')
    }
  })
})

describe('publish and modified dates', () => {
  const posting = (path: string) =>
    jsonLdBlocks(read(path)).find((block) => block['@type'] === 'BlogPosting')!
  const meta = (path: string, property: string) =>
    new RegExp(`<meta property="${property}" content="([^"]+)">`).exec(read(path))?.[1]

  test('dateModified and article:modified_time use `updated`, falling back to `date`', () => {
    // Lisbon sets updated: 2026-09-28; How to be proactive has no `updated`.
    for (const path of ['blog/lisbon-ai-2026/index.html', 'pt-br/blog/lisbon-ai-2026/index.html']) {
      expect(posting(path).datePublished).toBe('2026-09-25T00:00:00.000Z')
      expect(posting(path).dateModified).toBe('2026-09-28T00:00:00.000Z')
      expect(meta(path, 'article:published_time')).toBe('2026-09-25T00:00:00.000Z')
      expect(meta(path, 'article:modified_time')).toBe('2026-09-28T00:00:00.000Z')
    }
    const plain = 'blog/how-to-be-proactive/index.html'
    expect(posting(plain).dateModified).toBe(posting(plain).datePublished)
    expect(meta(plain, 'article:modified_time')).toBe(meta(plain, 'article:published_time'))
  })

  test('posts revised on 2026-10-11 carry that dateModified', () => {
    for (const path of [
      'blog/old-macbook-context-server/index.html',
      'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
      'blog/how-always-on-agents-work/index.html',
      'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html',
    ]) {
      expect(posting(path).dateModified).toBe('2026-10-11T00:00:00.000Z')
      expect(meta(path, 'article:modified_time')).toBe('2026-10-11T00:00:00.000Z')
    }
  })

  test('every post carries both article times', () => {
    for (const path of htmlPages().filter((path) =>
      /^(pt-br\/)?blog\/(?!tag\/)[^/]+\/index\.html$/.test(path),
    )) {
      expect(meta(path, 'article:published_time')).toBeDefined()
      expect(meta(path, 'article:modified_time')).toBeDefined()
      expect(posting(path).dateModified).toBe(meta(path, 'article:modified_time'))
    }
  })

  test('sitemap lastmod: posts use their last edit, indexes the newest post in their language', () => {
    const entries = sitemapEntries()
    expect(entries.get('https://franklinjavier.com/blog/lisbon-ai-2026/')?.lastmod).toBe(
      '2026-09-28',
    )
    expect(entries.get('https://franklinjavier.com/blog/how-to-be-proactive/')?.lastmod).toBe(
      String(posting('blog/how-to-be-proactive/index.html').datePublished).slice(0, 10),
    )
    for (const [prefix, lang] of [
      ['', 'en'],
      ['pt-br/', 'pt-BR'],
    ]) {
      const newest = htmlPages()
        .filter((path) => path.startsWith(`${prefix}blog/`) && !path.includes('/tag/'))
        .map((path) => jsonLdBlocks(read(path)).find((block) => block['@type'] === 'BlogPosting'))
        .filter((block) => block && block.inLanguage === lang)
        .map((block) => String(block!.dateModified).slice(0, 10))
        .sort()
        .at(-1)
      expect(entries.get(`https://franklinjavier.com/${prefix}`)?.lastmod).toBe(newest)
      expect(entries.get(`https://franklinjavier.com/${prefix}blog/`)?.lastmod).toBe(newest)
    }
  })

  test('static pages use their `updated` frontmatter or omit lastmod (never the build date)', () => {
    const entries = sitemapEntries()
    expect(entries.get('https://franklinjavier.com/about/')?.lastmod).toBe('2026-09-28')
    expect(entries.get('https://franklinjavier.com/pt-br/cv/')?.lastmod).toBe('2026-09-28')
    expect(entries.get('https://franklinjavier.com/speaking/')?.lastmod).toBeUndefined()
  })
})

describe('localized home and blog metadata', () => {
  const description = (path: string) =>
    /<meta name="description" content="([^"]+)">/.exec(read(path))?.[1]
  const graphDescriptions = (path: string) => {
    const graph = jsonLdBlocks(read(path)).find((block) => '@graph' in block) as {
      '@graph': Record<string, unknown>[]
    }
    return graph['@graph'].map((node) => node.description)
  }
  const PT_HOME =
    'Sou Principal Engineer com 19 anos de experiência em front-end. Hoje construo produtos de IA e os harnesses que coordenam seus agentes e ferramentas.'
  const EN_HOME =
    "I'm a Principal Engineer with 19 years of front-end development experience, now building AI products and the agent harnesses behind them."

  test('PT home has its own title, description and JSON-LD description', () => {
    const html = read('pt-br/index.html')
    expect(html).toContain(
      '<title>Principal Engineer em Lisboa, Portugal - Franklin Javier</title>',
    )
    expect(description('pt-br/index.html')).toBe(PT_HOME)
    expect(html).toContain(`property="og:description" content="${PT_HOME}"`)
    expect(graphDescriptions('pt-br/index.html')).toEqual([PT_HOME, PT_HOME])
    expect(graphDescriptions('pt-br/blog/index.html')).toEqual([PT_HOME, PT_HOME])
  })

  test('EN home keeps its title and description', () => {
    expect(read('index.html')).toContain('<title>Principal Engineer - Franklin Javier</title>')
    expect(decodeEntities(description('index.html') ?? '')).toBe(EN_HOME)
    expect(graphDescriptions('index.html')).toEqual([EN_HOME, EN_HOME])
  })

  test('blog indexes describe the current focus in each language', () => {
    expect(decodeEntities(description('blog/index.html') ?? '')).toBe(
      'Notes on AI agents and the engineering behind them, alongside web performance, tooling, and lessons from years of front-end work.',
    )
    expect(description('pt-br/blog/index.html')).toBe(
      'Textos sobre agentes de IA e a engenharia por trás deles, além de performance web, ferramentas e experiências de trabalho com front-end.',
    )
  })
})

describe('series social cards', () => {
  const cases = [
    ['blog/old-macbook-context-server/index.html', '/images/og/old-macbook-context-server-en.png'],
    [
      'pt-br/blog/macbook-velho-virou-servidor-de-contexto/index.html',
      '/images/og/old-macbook-context-server-pt-br.png',
    ],
    ['blog/how-always-on-agents-work/index.html', '/images/og/always-on-agents-en.png'],
    [
      'pt-br/blog/como-funciona-um-agente-sempre-ligado/index.html',
      '/images/og/always-on-agents-pt-br.png',
    ],
  ]

  test('og:image, twitter:image and BlogPosting.image point at an existing 1200x630 PNG', () => {
    for (const [path, image] of cases) {
      const html = read(path)
      const url = `https://franklinjavier.com${image}`
      expect(html).toContain(`<meta property="og:image" content="${url}">`)
      expect(html).toContain(`<meta name="twitter:image" content="${url}">`)
      const posting = jsonLdBlocks(html).find((block) => block['@type'] === 'BlogPosting')
      expect(posting?.image).toBe(url)
      const file = join(DIST, image)
      expect(existsSync(file)).toBe(true)
      expect(statSync(file).size).toBeLessThan(100 * 1024)
      const png = readFileSync(file)
      expect(png.subarray(1, 4).toString()).toBe('PNG')
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
    }
  })
})

describe('lisbon post markup', () => {
  const paths = ['blog/lisbon-ai-2026/index.html', 'pt-br/blog/lisbon-ai-2026/index.html']

  test('slides use the real column for sizes and offer a 1200w step', () => {
    // sizes caps at the post column's max-width, read from the stylesheet.
    const column = /\.post-column \{\s*max-width: ([\d.]+rem);/.exec(
      readFileSync(join(import.meta.dir, '..', 'src', 'styles', 'prose.css'), 'utf8'),
    )?.[1]
    expect(column).toBeDefined()
    for (const path of paths) {
      const imgs = [...read(path).matchAll(/<img [^>]*srcset="([^"]+)"[^>]*>/g)]
      expect(imgs.length).toBe(17)
      for (const [tag, srcset] of imgs) {
        expect(tag).toContain(`sizes="min(calc(100vw - 3rem), ${column})"`)
        for (const candidate of srcset.split(', ')) {
          expect(existsSync(join(DIST, candidate.split(' ')[0]))).toBe(true)
        }
      }
      // Every slide wider than 1200px has the step (two sources are narrower).
      expect(imgs.filter(([, srcset]) => srcset.includes(' 1200w')).length).toBe(15)
    }
  })

  test('the before/after table has column and row header cells', () => {
    for (const path of paths) {
      const table = /<table>(?:(?!<\/table>).)*?scope="row">Preview<\/th>.*?<\/table>/s.exec(
        read(path),
      )?.[0]
      expect(table).toBeDefined()
      expect(table!.match(/<th scope="col">/g)).toHaveLength(2)
      expect(table!.match(/<th scope="row">/g)).toHaveLength(4)
    }
  })
})

describe('post HTML weight', () => {
  // The TOC list used to ship twice (rail + <details>), ~37 KB on this page.
  test('long posts ship the TOC list once and stay under budget', () => {
    for (const path of [
      'pt-br/blog/lisbon-ai-2026/index.html',
      'blog/how-always-on-agents-work/index.html',
    ]) {
      const html = read(path)
      expect(html.match(/<ol>\s*<li><a href="#/g)).toHaveLength(1)
      const navs = [...html.matchAll(/<nav data-toc.*?<\/nav>/gs)].map((m) => m[0].length)
      expect(navs).toHaveLength(2)
      // The rail nav is a shell: heading, progress line, empty slot.
      expect(Math.min(...navs)).toBeLessThan(1500)
    }
    expect(read('pt-br/blog/lisbon-ai-2026/index.html').length).toBeLessThan(210_000)
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

  // guards: Hosting build selection must not leak Vercel analytics onto Cloudflare or remove it from Vercel.
  test('only emits Vercel Analytics client JS on Vercel builds', () => {
    const html = read('index.html')
    expect(html).not.toMatch(/_astro\/[^"]+\.js/)

    const moduleScripts = [...html.matchAll(/<script type="module">(.*?)<\/script>/gs)].map(
      (match) => match[1],
    )

    if (process.env.VERCEL === '1') {
      expect(moduleScripts).toHaveLength(1)
      expect(moduleScripts[0]).toContain('vercel-analytics')
      expect(moduleScripts[0]).toContain('@vercel/analytics')
    } else {
      expect(moduleScripts).toHaveLength(0)
      expect(html).not.toContain('/_vercel/insights/script.js')
    }
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

  // guards: HTTP/HTML discovery drift subscribes Portuguese readers to English posts.
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
      expect(value).toContain(
        `<${rule.source.startsWith('/pt-br') ? '/pt-br' : ''}/rss.xml>; rel="alternate"`,
      )
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

// guards: RSS/content routing drift sends subscribers mixed languages or broken post links.
describe('localized RSS feeds', () => {
  const window = new Window()
  for (const [prefix, lang] of [
    ['', 'en'],
    ['pt-br/', 'pt-BR'],
  ]) {
    test(`${lang} feed parses and matches every published page in its language`, () => {
      const xml = new window.DOMParser().parseFromString(
        read(`${prefix}rss.xml`),
        'application/xml',
      )
      expect(xml.querySelector('parsererror')).toBeNull()
      expect(xml.documentElement.tagName).toBe('rss')
      expect(xml.querySelector('channel > language')?.textContent).toBe(lang)
      const links = [...xml.querySelectorAll('item')].map((item) => {
        const url = new URL(item.querySelector('link')!.textContent)
        expect(url.origin).toBe('https://franklinjavier.com')
        const path = `${url.pathname.slice(1)}index.html`
        expect(existsSync(join(DIST, path))).toBe(true)
        expect(read(path)).toContain(`<html lang="${lang}"`)
        const post = jsonLdBlocks(read(path)).find((block) => block['@type'] === 'BlogPosting')!
        expect(new Date(item.querySelector('pubDate')!.textContent).toISOString()).toBe(
          String(post.datePublished),
        )
        expect(sitemapEntries().has(url.href)).toBe(true)
        return path
      })
      const pages = htmlPages().filter(
        (path) =>
          path.startsWith(`${prefix}blog/`) &&
          jsonLdBlocks(read(path)).some(
            (block) => block['@type'] === 'BlogPosting' && block.inLanguage === lang,
          ),
      )
      expect(links.sort()).toEqual(pages.sort())
      expect(links.length).toBeGreaterThan(0)
      expect(read('llms.txt')).toContain(`https://franklinjavier.com/${prefix}rss.xml`)
    })
  }

  // guards: Layout/feed discovery drift subscribes readers to the wrong language.
  test('every page advertises the feed matching its HTML language in head', () => {
    for (const path of htmlPages()) {
      const doc = new window.DOMParser().parseFromString(read(path), 'text/html')
      const lang = doc.documentElement.lang
      const feeds = doc.head.querySelectorAll('link[rel="alternate"][type="application/rss+xml"]')
      expect(feeds).toHaveLength(1)
      expect(feeds[0].getAttribute('hreflang')).toBe(lang)
      expect(feeds[0].getAttribute('href')).toBe(lang === 'pt-BR' ? '/pt-br/rss.xml' : '/rss.xml')
    }
  })
})

describe('related posts', () => {
  const cases = [
    {
      path: 'blog/old-macbook-context-server/',
      heading: 'Related posts',
      prefix: '/blog/',
      expected: ['open-source-agent-skills', 'how-always-on-agents-work', 'lisbon-ai-2026'],
      unmatched: 'blog/git-password-cache/',
    },
    {
      path: 'pt-br/blog/macbook-velho-virou-servidor-de-contexto/',
      heading: 'Posts relacionados',
      prefix: '/pt-br/blog/',
      expected: [
        'skills-open-source-para-agentes',
        'como-funciona-um-agente-sempre-ligado',
        'lisbon-ai-2026',
      ],
      unmatched: 'pt-br/blog/cache-de-senha-no-git/',
    },
  ]
  for (const entry of cases) {
    // guards: HTML/Markdown content-flow divergence and language leakage send readers to different or foreign posts.
    test(`${entry.prefix} ranks shared tags before recency in both formats`, () => {
      const window = new Window()
      try {
        const doc = new window.DOMParser().parseFromString(
          read(`${entry.path}index.html`),
          'text/html',
        )
        const section = doc.querySelector('section[aria-labelledby="related-posts"]')!
        expect(section.querySelector('h2')?.textContent).toBe(entry.heading)
        const urls = [...section.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '')
        expect(urls).toEqual(entry.expected.map((slug) => `${entry.prefix}${slug}/`))
        expect(urls).toHaveLength(3)
        expect(urls).not.toContain(`/${entry.path}`)
        expect(urls.every((url) => url?.startsWith(entry.prefix))).toBe(true)
        const md = read(`${entry.path}index.md`)
          .split(`## ${entry.heading}\n\n`)[1]
          .split('\n\n')[0]
        const markdownUrls = [...md.matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(
          (match) => new URL(match[1]).pathname,
        )
        expect(markdownUrls).toEqual(urls)
      } finally {
        window.close()
      }
    })
    // guards: HTML/Markdown content-flow divergence renders empty recommendation sections for alternate readers.
    test(`${entry.prefix} omits related posts without shared tags`, () => {
      expect(read(`${entry.unmatched}index.html`)).not.toContain('aria-labelledby="related-posts"')
      expect(read(`${entry.unmatched}index.md`)).not.toContain(`## ${entry.heading}`)
    })
  }
})

// guards: HTML/Markdown generated-file drift restores duplicate profiles or loses About-only facts.
describe('Home showcase and About narrative', () => {
  for (const [prefix, experience, projects, city] of [
    ['', 'Work Experience', 'Side projects', 'Lisbon'],
    ['pt-br/', 'Experiência Profissional', 'Projetos paralelos', 'Lisboa'],
  ]) {
    test(`${prefix || 'en/'} keeps both formats aligned and the localized CV reachable`, () => {
      const window = new Window()
      try {
        const home = new window.DOMParser().parseFromString(
          read(`${prefix}index.html`),
          'text/html',
        )
        const about = new window.DOMParser().parseFromString(
          read(`${prefix}about/index.html`),
          'text/html',
        )
        const homeMd = read(`${prefix}index.md`)
        const aboutMd = read(`${prefix}about/index.md`)
        expect([...home.querySelectorAll('h2')].map((h) => h.textContent)).not.toContain(experience)
        expect(homeMd).not.toContain(`## ${experience}`)
        expect(home.querySelector('#about')?.textContent).toContain('Principal Engineer')
        expect(home.querySelector('#about')?.textContent).toContain('Stone Giant Studio')
        expect(homeMd).toContain('Principal Engineer')
        expect(homeMd).toContain('Stone Giant Studio')
        for (const id of ['posts', 'projects', 'open-source']) {
          expect(homeMd).toContain(`## ${home.querySelector(`#${id} h2`)?.textContent}`)
        }
        expect(about.querySelector('article ul')).toBeNull()
        expect(about.querySelector(`article a[href="/${prefix}cv/"]`)).not.toBeNull()
        expect(aboutMd).toContain(`](/${prefix}cv/)`)
        expect(aboutMd).not.toContain(`## ${projects}`)
        expect(aboutMd.match(/^- .+/gm)).toEqual([
          `- Canonical: https://franklinjavier.com/${prefix}about/`,
        ])
        for (const fact of [
          city,
          'React',
          'stonegiantstudio/skills',
          'storefront',
          '1M',
          'Erastus',
        ]) {
          expect(about.querySelector('article')?.textContent).toContain(fact)
          expect(aboutMd).toContain(fact)
        }
      } finally {
        window.close()
      }
    })
  }
})
