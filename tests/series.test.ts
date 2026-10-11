import { describe, expect, test } from 'bun:test'
import {
  seriesDrift,
  seriesMarker,
  seriesNav,
  seriesNextLabel,
  seriesPartLabel,
  type SeriesPost,
} from '../src/lib/series'
import { SERIES, type Series } from '../src/data/series'
import type { Lang } from '../src/lib/markdown'

function part(n: number, key: string): Series['parts'][number] {
  return {
    part: n,
    translationKey: key,
    posts: {
      en: { title: `Part ${n}`, url: `/blog/p${n}/`, takeaway: `Takeaway ${n}` },
      'pt-br': { title: `Parte ${n}`, url: `/pt-br/blog/p${n}/`, takeaway: `Lição ${n}` },
    },
  }
}

const catalog: Record<string, Series> = {
  agents: {
    name: { en: 'experiments', 'pt-br': 'experimentos' },
    // Out of order on purpose: neighbours follow part numbers, not array order.
    parts: [part(3, 'k3'), part(1, 'k1'), part(2, 'k2')],
    glossary: [],
  },
}

function postsFor(c: Record<string, Series>): SeriesPost[] {
  return Object.entries(c).flatMap(([key, series]) =>
    series.parts.flatMap((p) =>
      (['en', 'pt-br'] as Lang[]).map((lang) => ({
        lang,
        title: p.posts[lang].title,
        url: p.posts[lang].url,
        translationKey: p.translationKey,
        series: { key, part: p.part },
      })),
    ),
  )
}

describe('seriesNav', () => {
  test('counts the parts in the data and resolves neighbours by part number', () => {
    expect(seriesNav({ key: 'agents', part: 2 }, 'en', catalog)).toEqual({
      name: 'experiments',
      part: 2,
      total: 3,
      previous: { part: 1, title: 'Part 1', url: '/blog/p1/' },
      next: { part: 3, title: 'Part 3', url: '/blog/p3/' },
    })
  })

  test('the first part has no previous and the last has no next', () => {
    expect(seriesNav({ key: 'agents', part: 1 }, 'pt-br', catalog).previous).toBeUndefined()
    expect(seriesNav({ key: 'agents', part: 3 }, 'pt-br', catalog).next).toBeUndefined()
  })

  test('uses the titles and URLs of the requested language', () => {
    expect(seriesNav({ key: 'agents', part: 1 }, 'pt-br', catalog).next).toEqual({
      part: 2,
      title: 'Parte 2',
      url: '/pt-br/blog/p2/',
    })
  })

  test('throws for series or parts missing from the data', () => {
    expect(() => seriesNav({ key: 'cooking', part: 1 }, 'en', catalog)).toThrow('Unknown series')
    expect(() => seriesNav({ key: 'agents', part: 9 }, 'en', catalog)).toThrow('no part 9')
  })
})

describe('series labels', () => {
  test('marker reads "Part N of M · <series name>"', () => {
    expect(seriesMarker(seriesNav({ key: 'agents', part: 2 }, 'pt-br', catalog), 'pt-br')).toBe(
      'Parte 2 de 3 · experimentos',
    )
    expect(seriesMarker(seriesNav({ key: 'agents', part: 1 }, 'en', catalog), 'en')).toBe(
      'Part 1 of 3 · experiments',
    )
  })

  test('previous and next part labels', () => {
    const link = { part: 2, title: 'Como funciona um agente em loop', url: '/x/' }
    expect(seriesPartLabel({ ...link, part: 1, title: 'Old MacBook' }, 'en')).toBe(
      'Part 1: Old MacBook',
    )
    expect(seriesNextLabel(link, 'pt-br')).toBe(
      'Próximo: Parte 2 · Como funciona um agente em loop',
    )
    expect(seriesNextLabel({ ...link, title: 'How an agent loop works' }, 'en')).toBe(
      'Next: Part 2 · How an agent loop works',
    )
  })
})

describe('seriesDrift', () => {
  test('reports nothing when data and posts agree', () => {
    expect(seriesDrift(postsFor(catalog), catalog)).toEqual([])
  })

  test('reports a title, URL, language or part mismatch', () => {
    const posts = postsFor(catalog)
    posts[0] = { ...posts[0], title: 'Renamed' }
    posts[1] = { ...posts[1], series: { key: 'agents', part: 2 } }
    const problems = seriesDrift(posts.slice(0, -1), catalog)
    expect(problems.some((p) => p.includes('title "Part 3" but post says "Renamed"'))).toBe(true)
    expect(problems.some((p) => p.includes('post frontmatter series'))).toBe(true)
    expect(problems.some((p) => p.includes('no published post at /pt-br/blog/p2/'))).toBe(true)
    expect(problems.some((p) => p.includes('not listed in the data'))).toBe(true)
  })

  test('reports posts with series frontmatter that the data does not list', () => {
    const extra: SeriesPost = {
      lang: 'en',
      title: 'Part 4',
      url: '/blog/p4/',
      translationKey: 'k4',
      series: { key: 'agents', part: 4 },
    }
    expect(seriesDrift([...postsFor(catalog), extra], catalog)).toEqual([
      '/blog/p4/: series agents part 4 is not listed in the data',
    ])
  })

  test('reports stale data when no published post is a member any more', () => {
    const posts = postsFor(catalog).map((post) => ({ ...post, series: undefined }))
    const problems = seriesDrift(posts, catalog)
    expect(problems).toHaveLength(6)
    expect(problems).toContain('agents part 1 (en): post frontmatter series is undefined')
    expect(problems).toContain('agents part 3 (pt-br): post frontmatter series is undefined')
  })

  test('reports stale data when every listed part is drafted', () => {
    const problems = seriesDrift([], catalog)
    expect(problems).toHaveLength(6)
    expect(problems).toContain('agents part 1 (en): no published post at /blog/p1/')
    expect(problems).toContain('agents part 3 (pt-br): no published post at /pt-br/blog/p3/')
  })

  test('reports gaps in part numbering', () => {
    const gappy = { agents: { ...catalog.agents, parts: [part(1, 'k1'), part(3, 'k3')] } }
    expect(seriesDrift(postsFor(gappy), gappy)).toContain(
      'agents: parts must be numbered 1..2, got 1, 3',
    )
  })
})

describe('series data', () => {
  test('every series has a name, parts and glossary in both languages', () => {
    for (const series of Object.values(SERIES)) {
      for (const lang of ['en', 'pt-br'] as Lang[]) {
        expect(series.name[lang]).toBeTruthy()
        for (const p of series.parts) {
          expect(p.posts[lang].takeaway).toBeTruthy()
        }
        for (const entry of series.glossary) {
          expect(entry.term[lang]).toBeTruthy()
          expect(entry.definition[lang]).toBeTruthy()
        }
      }
    }
  })
})
