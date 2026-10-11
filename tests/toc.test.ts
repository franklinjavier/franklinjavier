import { describe, expect, test } from 'bun:test'
import type { MarkdownHeading } from 'astro'
import { hasToc, tocItems } from '../src/lib/toc'

const headings: MarkdownHeading[] = [
  { depth: 1, slug: 'title', text: 'Title' },
  { depth: 2, slug: 'closing-the-app', text: 'Closing the app should leave the work intact' },
  { depth: 3, slug: 'the-loop', text: 'The week-1 loop' },
  { depth: 2, slug: 'safe-retries', text: 'A retry must not charge you again' },
  { depth: 4, slug: 'detail', text: 'Detail' },
  { depth: 2, slug: 'getting-started', text: 'My proposal for getting started' },
]

describe('tocItems', () => {
  test('uses the short label override for its slug and falls back to the heading text', () => {
    const items = tocItems(headings, { 'safe-retries': 'Safe retries', unknown: 'Ignored' })
    expect(items.map((item) => item.label)).toEqual([
      'Closing the app should leave the work intact',
      'The week-1 loop',
      'Safe retries',
      'My proposal for getting started',
    ])
    // The full heading text is kept for the title attribute.
    expect(items[2]).toMatchObject({ slug: 'safe-retries', text: 'A retry must not charge you again' })
  })

  test('ignores blank overrides', () => {
    expect(tocItems(headings, { 'safe-retries': '   ' })[2].label).toBe(
      'A retry must not charge you again',
    )
  })

  test('numbers h2 sections 01, 02, … and leaves h3 unnumbered', () => {
    const items = tocItems(headings)
    expect(items.map((item) => [item.depth, item.number])).toEqual([
      [2, '01'],
      [3, undefined],
      [2, '02'],
      [2, '03'],
    ])
  })

  test('keeps only h2/h3 and needs two of them for a TOC', () => {
    expect(tocItems([{ depth: 4, slug: 'x', text: 'X' }])).toEqual([])
    expect(hasToc(headings)).toBe(true)
    expect(hasToc(headings.slice(0, 2))).toBe(false)
  })
})
