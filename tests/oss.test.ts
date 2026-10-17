// guards: generated-file sync — bilingual HTML and Markdown must not diverge from the approved repository list or omit offline content.
import { expect, test, spyOn } from 'bun:test'
import { read } from './dist-helpers'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { OPEN_SOURCE } from '../src/lib/site'
import { ui } from '../src/i18n/ui'

const originalFetch = globalThis.fetch
globalThis.fetch = (async () => {
  throw Error('offline')
}) as unknown as typeof fetch
const { fetchStars, formatStars, stars, orderOpenSource } = await import('../src/lib/oss')
globalThis.fetch = originalFetch

test('offline metadata failure preserves the curated bilingual HTML and Markdown contract', () => {
  expect(stars).toEqual({})
  expect(OPEN_SOURCE.map(({ name }) => name)).toEqual([
    'remix-ecommerce',
    'translate',
    'shadcn-widget',
    'oficina',
    'grokbot-quota-template',
    'remix-starter-template',
    'retabnews',
    'stonegiantstudio/skills',
  ])
  expect(OPEN_SOURCE.map(({ language }) => language)).toEqual([
    'TypeScript',
    'Swift',
    'TypeScript',
    'TypeScript',
    'Python',
    'TypeScript',
    'TypeScript',
    'JavaScript',
  ])
  const directory = mkdtempSync(join(process.cwd(), '.oss-offline-'))
  try {
    const preload = join(directory, 'offline.mjs')
    const calls = join(directory, 'calls')
    const output = join(directory, 'dist')
    writeFileSync(
      preload,
      `import { appendFileSync } from 'node:fs';
      globalThis.fetch = async (url) => {
        if (!['https://api.github.com/users/franklinjavier/repos?per_page=100', 'https://api.github.com/repos/stonegiantstudio/skills'].includes(String(url)))
          throw Error('Unexpected external request');
        appendFileSync(${JSON.stringify(calls)}, 'call\\n');
        throw Error('Offline fixture');
      };`,
    )
    const build = spawnSync('bun', ['run', 'astro', 'build', '--outDir', output], {
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${pathToFileURL(preload).href}`]
          .filter(Boolean)
          .join(' '),
      },
      encoding: 'utf8',
      timeout: 30000,
    })
    expect(build.error).toBeUndefined()
    expect(build.status, build.stderr + build.stdout).toBe(0)
    expect(readFileSync(calls, 'utf8')).toBe('call\ncall\n')
    let publishedOrder: string[] | undefined
    for (const offline of [false, true]) {
      for (const lang of ['en', 'pt-br'] as const) {
        const prefix = lang === 'en' ? '' : 'pt-br/'
        for (const extension of ['html', 'md']) {
          const file = `${prefix}index.${extension}`
          const page = offline ? readFileSync(join(output, file), 'utf8') : read(file)
          const start =
            extension === 'html'
              ? page.indexOf('id="open-source"')
              : page.indexOf(`## ${ui[lang]['oss.title']}`)
          expect(start).toBeGreaterThan(page.indexOf(ui[lang]['projects.title']))
          const section =
            extension === 'html'
              ? page.slice(start).split('</section>')[0]
              : page.slice(start).split('\n\n[')[0]
          expect(section).toContain(ui[lang]['oss.title'])
          expect(section).not.toContain('A-Byte-of-Python')
          const links = [
            ...section.matchAll(
              /https:\/\/github.com\/(?:franklinjavier|stonegiantstudio)\/[^"\s)]+/g,
            ),
          ].map(([url]) => url.replaceAll('&amp;', '&'))
          publishedOrder ??= links
          expect(links).toEqual(offline ? OPEN_SOURCE.map(({ url }) => url) : publishedOrder)
          expect(new Set(links)).toEqual(new Set(OPEN_SOURCE.map(({ url }) => url)))
          for (const repo of OPEN_SOURCE) {
            expect(section).toContain(ui[lang][`oss.${repo.key}`])
            if (repo.language) expect(section).toContain(repo.language)
          }
          if (offline) {
            expect(section).not.toContain('★')
            expect(section).not.toContain(ui[lang]['oss.stars'])
          }
        }
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}, 40000)

// guards: security/privacy boundary — external build input must not break publishing or introduce unapproved metadata.
test('bounded unauthenticated fetch validates counts and tolerates upstream failures', async () => {
  let calls = 0
  const signals = new Set<AbortSignal>()
  const timeout = spyOn(AbortSignal, 'timeout')
  const counts = await fetchStars((async (
    url: Parameters<typeof fetch>[0],
    options?: RequestInit,
  ) => {
    calls++
    expect(options?.redirect).toBe('error')
    expect(options?.credentials).toBe('omit')
    expect(options?.signal).toBeInstanceOf(AbortSignal)
    signals.add(options!.signal as AbortSignal)
    expect(options?.headers).toBeUndefined()
    if (String(url).endsWith('/skills'))
      return Response.json({ name: 'skills', stargazers_count: 8 })
    expect(url).toBe('https://api.github.com/users/franklinjavier/repos?per_page=100')
    return Response.json([
      { name: 'remix-ecommerce', stargazers_count: 16 },
      { name: 'oficina', stargazers_count: 0 },
      { name: 'translate', stargazers_count: 1200 },
      { name: 'retabnews', stargazers_count: -1 },
      { name: 'shadcn-widget', stargazers_count: 1.5 },
      { name: 'unapproved', stargazers_count: 20 },
    ])
  }) as unknown as typeof fetch)
  expect(calls).toBe(2)
  expect(signals.size).toBe(1)
  expect(timeout).toHaveBeenCalledTimes(1)
  expect(timeout).toHaveBeenCalledWith(2000)
  timeout.mockRestore()
  expect(counts).toEqual({
    'remix-ecommerce': 16,
    oficina: 0,
    translate: 1200,
    'stonegiantstudio/skills': 8,
  })
  expect([16, 1200, 1000, 0].map(formatStars)).toEqual(['16', '1.2k', '1k', '0'])
  for (const failure of [
    async () => {
      throw Error('offline')
    },
    async () => new Response('', { status: 403 }),
    async () => new Response('{'),
    async () => Response.json({ message: 'invalid' }),
    async () => {
      throw new DOMException('aborted', 'AbortError')
    },
    async () =>
      ({
        ok: true,
        json: async () => {
          throw new DOMException('aborted body', 'AbortError')
        },
      }) as unknown as Response,
  ])
    expect(await fetchStars(failure as unknown as typeof fetch)).toEqual({})
})

// guards: generated-file sync — shared ranking keeps HTML and Markdown ordered by stars and push recency.
test('ranking uses stars, then most recent push, and preserves curated offline order', () => {
  expect(orderOpenSource({}, {})).toEqual(OPEN_SOURCE)
  expect(
    orderOpenSource(
      { translate: 10, oficina: 10, retabnews: 20 },
      {
        translate: '2026-01-01T00:00:00Z',
        oficina: '2026-02-01T00:00:00Z',
      },
    )
      .slice(0, 3)
      .map(({ name }) => name),
  ).toEqual(['retabnews', 'oficina', 'translate'])
})
