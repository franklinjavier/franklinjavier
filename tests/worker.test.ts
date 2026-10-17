// map: Offline Worker negotiation and Vercel/Cloudflare hosting contract checks.
import { afterEach, expect, test } from 'bun:test'
import worker from '../worker'
import rules from '../vercel.json'
import { markdownLinkHeader, notFoundMarkdown } from '../src/lib/negotiation'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})
function fixture(missing = false) {
  globalThis.fetch = (() => {
    throw new Error('unexpected network probe')
  }) as unknown as typeof fetch
  const calls: Request[] = []
  return {
    calls,
    env: {
      ASSETS: {
        async fetch(request: Request) {
          calls.push(request)
          return new Response(request.method === 'HEAD' ? null : 'asset bytes', {
            status: missing ? 404 : 200,
            headers: { 'Content-Type': 'text/html', ETag: 'fixture', Vary: 'Origin' },
          })
        },
      },
    },
  }
}
const origin = 'https://franklinjavier.com'
const accepts: [string | null, boolean][] = [
  [null, false],
  ['', false],
  ['text/markdown;q=1, text/plain;q=0.8', true],
  ['text/markdown, */*;q=0.1', true],
  ['text/html,application/xhtml+xml,*/*;q=0.8', false],
  ['*/*', false],
  ['text/markdown;q=0', false],
  ['text/markdown', true],
  ['text/markdown;q=0.5,text/html;q=0.5', true],
  ['text/markdown;q=0.9,text/html;q=0.5', true],
  ['text/markdown;q=0.5,text/html;q=0.9', false],
]
for (const path of [
  '/',
  '/pt-br/',
  '/blog/example/',
  '/pt-br/blog/exemplo/',
  '/blog/example',
  '/pt-br/blog/exemplo',
]) {
  for (const [accept, markdown] of accepts) {
    // guards: Accept negotiation across the asset boundary must not serve or cache the wrong representation.
    test(`${path} Accept ${accept}`, async () => {
      const { env, calls } = fixture()
      const response = await worker.fetch(
        new Request(origin + path, {
          headers: accept ? { Accept: accept, Cookie: 'fixture=1' } : {},
        }),
        env,
      )
      expect(calls.length).toBe(1)
      expect(new URL(calls[0]!.url).pathname).toBe(
        markdown ? path.replace(/\/?$/, '/') + 'index.md' : path,
      )
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('asset bytes')
      expect(response.headers.get('etag')).toBe('fixture')
      expect(response.headers.get('vary')).toBe('Origin, Accept')
      expect(response.headers.get('content-type')).toBe(
        markdown ? 'text/markdown; charset=utf-8' : 'text/html',
      )
      if (accept) expect(calls[0]!.headers.get('cookie')).toBe('fixture=1')
      if (path.includes('/blog/'))
        expect(response.headers.get('link')).toBe(markdown ? null : markdownLinkHeader(path))
    })
  }
}
for (const method of ['GET', 'HEAD']) {
  for (const path of ['/blog/example.md', '/pt-br/blog/exemplo.md', '/missing/']) {
    // guards: Missing twin recovery and HEAD semantics must survive transport changes without HTML leakage.
    test(`${method} ${path} missing twin`, async () => {
      const { env, calls } = fixture(true)
      const response = await worker.fetch(
        new Request(origin + path, {
          method,
          headers: { Accept: 'text/markdown' },
        }),
        env,
      )
      expect(calls.length).toBe(1)
      expect(calls[0]!.method).toBe(method)
      const page = path.endsWith('.md') ? path.slice(0, -3) + '/' : path
      expect(new URL(calls[0]!.url).pathname).toBe(page + 'index.md')
      expect(response.status).toBe(404)
      expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
      expect(await response.text()).toBe(method === 'HEAD' ? '' : notFoundMarkdown(path))
    })
  }
  // guards: Suffix and direct twin routing must preserve method, bytes and Markdown MIME across ASSETS.
  test(`${method} suffix and direct twins`, async () => {
    for (const path of ['/blog/example.md', '/blog/example/index.md', '/index.md']) {
      const { env, calls } = fixture()
      const response = await worker.fetch(new Request(origin + path, { method }), env)
      expect(calls.length).toBe(1)
      expect(new URL(calls[0]!.url).pathname).toBe(
        path === '/blog/example.md' ? '/blog/example/index.md' : path,
      )
      expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
      expect(await response.text()).toBe(method === 'HEAD' ? '' : 'asset bytes')
    }
  })
}
// guards: Matcher exclusions and post canonical rules must not rewrite files or advertise invalid twins.
test('asset, legacy and noncanonical post exclusions', async () => {
  for (const path of [
    '/image.png',
    '/rss.xml',
    '/posts/nested/slug',
    '/blog/UPPER/',
    '/blog/%68ello/',
    '/blog/',
    '/blog/tag/ai/',
  ]) {
    const { env, calls } = fixture()
    const response = await worker.fetch(new Request(origin + path), env)
    expect(new URL(calls[0]!.url).pathname).toBe(path)
    expect(response.headers.get('link')).toBeNull()
  }
  for (const path of ['/image.png', '/rss.xml', '/posts/nested/slug']) {
    const { env, calls } = fixture()
    await worker.fetch(new Request(origin + path, { headers: { Accept: 'text/markdown' } }), env)
    expect(new URL(calls[0]!.url).pathname).toBe(path)
  }
})
// guards: Vercel redirect migration must retain old URLs, query strings and zero asset lookups.
test('redirects agree with Vercel and static rules', async () => {
  const lines = (await Bun.file('public/_redirects').text()).trim().split('\n')
  expect(lines.length).toBe(rules.redirects.length)
  for (const [index, rule] of rules.redirects.entries()) {
    const [source, destination, status, extra] = lines[index]!.split(/\s+/)
    expect(extra).toBeUndefined()
    expect(source).toBe(rule.source)
    expect(destination).toBe(rule.destination)
    expect(status).toBe(rule.permanent ? '308' : '307')
    const { env, calls } = fixture()
    const response = await worker.fetch(
      new Request(origin + rule.source.replace(':slug', 'old-post') + '?ref=old', {
        headers: { Accept: 'text/markdown' },
      }),
      env,
    )
    expect(response.status).toBe(Number(status))
    expect(response.headers.get('location')).toBe(
      origin + rule.destination.replace(':slug', 'old-post') + '?ref=old',
    )
    expect(response.headers.get('vary')).toBe('Accept')
    expect(calls.length).toBe(0)
  }
})
function staticHeaders(text: string, path: string) {
  const headers = new Headers()
  for (const block of text.trim().split(/\n\s*\n/)) {
    const [pattern, ...entries] = block.split('\n')
    expect(['/*', '/*.md', '/llms.txt', '/', '/pt-br', '/pt-br/']).toContain(pattern!)
    if (!(pattern === '/*' || (pattern === '/*.md' ? path.endsWith('.md') : path === pattern)))
      continue
    for (const entry of entries) {
      const match = /^  ([\w-]+): (.+)$/.exec(entry)!
      expect(match).not.toBeNull()
      headers.set(match[1]!, match[2]!)
    }
  }
  return headers
}
// guards: Generated hosting files and Worker headers must stay synchronized with Vercel discovery and MIME rules.
test('all static header groups match Vercel and Worker responses', async () => {
  const text = await Bun.file('public/_headers').text()
  for (const path of [
    '/',
    '/pt-br',
    '/pt-br/',
    '/llms.txt',
    '/index.md',
    '/blog/example/index.md',
    '/asset.js',
  ]) {
    const expected = new Headers()
    for (const rule of rules.headers) {
      if (new RegExp('^' + rule.source + '$').test(path)) {
        for (const header of rule.headers) expected.set(header.key, header.value)
      }
    }
    const translated = staticHeaders(text, path)
    expect([...translated]).toEqual([...expected])
    for (const accept of ['text/html', 'text/markdown']) {
      const { env } = fixture()
      const response = await worker.fetch(
        new Request(origin + path, { headers: { Accept: accept } }),
        env,
      )
      for (const [key, value] of expected) {
        expect(response.headers.get(key)).toBe(key === 'vary' ? 'Origin, Accept' : value)
      }
    }
  }
  for (const file of ['_headers', '_redirects']) {
    expect(await Bun.file('dist/' + file).text()).toBe(await Bun.file('public/' + file).text())
  }
})
// guards: ASSETS failures must remain platform errors rather than fabricated successful content.
test('binding failures propagate', async () => {
  await expect(
    worker.fetch(new Request(origin), {
      ASSETS: {
        async fetch() {
          throw new Error('binding unavailable')
        },
      },
    }),
  ).rejects.toThrow('binding unavailable')
})
// guards: Wrapping asset responses must preserve cache validators and avoid duplicate negotiation headers.
test('HEAD HTML, existing Vary and asset status survive wrapping', async () => {
  let calls = 0
  const response = await worker.fetch(new Request(origin + '/blog/unknown/', { method: 'HEAD' }), {
    ASSETS: {
      async fetch(request) {
        calls++
        expect(request.method).toBe('HEAD')
        return new Response(null, {
          status: 404,
          headers: {
            Vary: 'Origin, accept',
            ETag: 'unchanged',
            Link: markdownLinkHeader('/blog/unknown/'),
          },
        })
      },
    },
  })
  expect(calls).toBe(1)
  expect(response.status).toBe(404)
  expect(response.headers.get('etag')).toBe('unchanged')
  expect(response.headers.get('vary')).toBe('Origin, accept')
  expect(response.headers.get('link')).toBe(markdownLinkHeader('/blog/unknown/'))
  expect(await response.text()).toBe('')
})
