// map: Tag allowlist gate and retired-tag redirect checks.
import { expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import worker from '../worker'
import { TAGS, TAG_ALIASES, tagRedirect } from '../src/lib/tags'
import type { Lang } from '../src/lib/markdown'

const base = 'src/content/blog'
const posts: [Lang, string][] = [
  ...readdirSync(base)
    .filter((file) => file.endsWith('.md'))
    .map((file): [Lang, string] => ['en', join(base, file)]),
  ...readdirSync(join(base, 'pt-br')).map((file): [Lang, string] => [
    'pt-br',
    join(base, 'pt-br', file),
  ]),
]

// guards: a new tag must be added to the allowlist on purpose, not created by a typo or a one-off.
test('every post uses only allowed tags for its language', async () => {
  for (const [lang, file] of posts) {
    const raw = /^tags:(.*)$/m.exec(await Bun.file(file).text())?.[1] ?? ''
    for (const tag of raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)) {
      expect({ file, tag, allowed: TAGS[lang].includes(tag) }).toEqual({ file, tag, allowed: true })
    }
  }
})

test('aliases point at allowed tags and never shadow one', () => {
  for (const lang of ['en', 'pt-br'] as const) {
    for (const [old, target] of Object.entries(TAG_ALIASES[lang])) {
      expect(TAGS[lang]).toContain(target)
      expect(TAGS[lang]).not.toContain(old)
    }
  }
})

test('tagRedirect resolves retired tag pages per language', () => {
  expect(tagRedirect('/blog/tag/front-end/')).toBe('/blog/tag/frontend/')
  expect(tagRedirect('/blog/tag/lifehack')).toBe('/blog/tag/productivity/')
  expect(tagRedirect('/pt-br/blog/tag/lifehack/')).toBe('/pt-br/blog/tag/produtividade/')
  expect(tagRedirect('/pt-br/blog/tag/confer%C3%AAncia/')).toBe('/pt-br/blog/tag/ia/')
  expect(tagRedirect('/blog/tag/frontend/')).toBeNull()
  expect(tagRedirect('/blog/tag/constructor/')).toBeNull()
  expect(tagRedirect('/blog/tag/%E0%A4%A/')).toBeNull()
  expect(tagRedirect('/blog/front-end/')).toBeNull()
})

test('Worker answers retired tag pages with a 308 and no asset lookup', async () => {
  const calls: Request[] = []
  const env = {
    ASSETS: {
      async fetch(request: Request) {
        calls.push(request)
        return new Response('asset')
      },
    },
  }
  const response = await worker.fetch(
    new Request('https://franklinjavier.com/pt-br/blog/tag/vida-pessoal/?ref=x'),
    env,
  )
  expect(response.status).toBe(308)
  expect(response.headers.get('location')).toBe(
    'https://franklinjavier.com/pt-br/blog/tag/pessoal/?ref=x',
  )
  expect(calls.length).toBe(0)
})
