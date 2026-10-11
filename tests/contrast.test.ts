// WCAG 2 contrast for the text tokens in src/styles/global.css (both themes)
// and the code-comment gray forced in prose.css on the dark code backgrounds.
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

function tokens(selector: string) {
  const start = css.indexOf(`${selector} {`)
  expect(start).toBeGreaterThanOrEqual(0)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
  )
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('text contrast (WCAG AA, 4.5:1)', () => {
  for (const [theme, selector] of [
    ['light', ':root'],
    ['dark', '.dark'],
  ]) {
    test(`${theme}: ink, ink-2 and muted on bg`, () => {
      const t = tokens(selector)
      for (const name of ['ink', 'ink-2', 'muted']) {
        expect(t[name]).toBeDefined()
        expect(ratio(t[name], t.bg)).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  test('code comment gray on the dark code backgrounds', () => {
    expect(ratio('#8b8b8b', '#101010')).toBeGreaterThanOrEqual(4.5)
    expect(ratio('#8b8b8b', '#1a1a1a')).toBeGreaterThanOrEqual(4.5)
  })
})
