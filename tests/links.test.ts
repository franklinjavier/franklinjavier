// map: Offline integrity gate for built internal links and fragment targets.
import { test, expect } from 'bun:test'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { Window } from 'happy-dom'
import { DIST, read, htmlPages } from './dist-helpers'
import { markdownPathFor, markdownSuffixPage } from '../src/lib/negotiation'
import config from '../vercel.json'

const origin = 'https://franklinjavier.com'
const decoder = new Window().document.createElement('textarea')
function decode(value: string): string {
  decoder.innerHTML = value
  return decoder.textContent
}

export function brokenLinks(dir = DIST): string[] {
  const files = new Set(
    readdirSync(dir, { recursive: true, encoding: 'utf-8' }).filter((file) =>
      statSync(join(dir, file)).isFile(),
    ),
  )
  const pages = new Map<string, { ids: Set<string>; links: string[] }>()
  for (const page of htmlPages(dir)) {
    const ids = new Set<string>()
    const links: string[] = []
    // Read actual tags only: examples inside code blocks are HTML-escaped.
    for (const [tag] of read(page, dir).matchAll(
      /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<[a-z][^>]*>/gi,
    )) {
      if (tag.startsWith('<!--')) continue
      for (const [, key, double, single, bare] of tag
        .slice(0, tag.indexOf('>') + 1)
        .matchAll(/\s(id|href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
        const value = decode(double ?? single ?? bare ?? '')
        if (key.toLowerCase() === 'id') ids.add(value)
        else if (key.toLowerCase() === 'srcset') {
          links.push(
            ...value
              .split(',')
              .map((part) => part.trim().split(/\s+/)[0]!)
              .filter(Boolean),
          )
        } else links.push(value)
      }
    }
    pages.set(page, { ids, links })
  }
  const broken: string[] = []
  for (const [page, { links }] of pages) {
    const base = new URL('/' + page.replace(/index\.html$/, ''), origin)
    for (const href of new Set(links)) {
      let url: URL
      try {
        url = new URL(href, base)
      } catch {
        broken.push(`${page} -> ${href}`)
        continue
      }
      if (url.origin !== origin) continue
      let path = url.pathname
      const visited = new Set<string>()
      while (!visited.has(path)) {
        visited.add(path)
        const rule = config.redirects.find(({ source }) =>
          new RegExp('^' + source.replaceAll('.', '\\.').replace(':slug', '([^/]+)') + '/?$').test(
            path,
          ),
        )
        if (!rule) break
        const slug = new RegExp(
          '^' + rule.source.replaceAll('.', '\\.').replace(':slug', '([^/]+)') + '/?$',
        ).exec(path)?.[1]
        path = rule.destination.replace(':slug', slug ?? '')
      }
      const suffix = markdownSuffixPage(path)
      if (suffix !== null) path = markdownPathFor(suffix)
      try {
        const file = decodeURIComponent(path).replace(/^\//, '')
        const target = files.has(file)
          ? file
          : `${file.replace(/\/$/, '')}${file ? '/' : ''}index.html`
        const fragment = decodeURIComponent(url.hash.slice(1))
        if (!files.has(target) || (fragment && !pages.get(target)?.ids.has(fragment))) {
          broken.push(`${page} -> ${href}`)
        }
      } catch {
        broken.push(`${page} -> ${href}`)
      }
    }
  }
  return broken
}

// guards: Content, routing and assets can drift apart and publish broken navigation in either language.
test('built EN and PT-BR pages link to existing internal pages, assets and IDs', () => {
  expect(brokenLinks(), 'Broken internal links (page -> href)').toEqual([])
})
