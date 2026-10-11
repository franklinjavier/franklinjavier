import { describe, expect, test } from 'bun:test'
import { readingMinutes, WORDS_PER_MINUTE } from '../src/lib/reading-time'

const words = (count: number) => Array.from({ length: count }, () => 'palavra').join(' ')

describe('readingMinutes', () => {
  test('rounds up and never drops below one minute', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes(words(10))).toBe(1)
    expect(readingMinutes(words(WORDS_PER_MINUTE))).toBe(1)
    expect(readingMinutes(words(WORDS_PER_MINUTE + 1))).toBe(2)
    expect(readingMinutes(words(WORDS_PER_MINUTE * 5))).toBe(5)
  })

  test('ignores fenced code, tags and image syntax', () => {
    const code = '```javascript\n' + words(WORDS_PER_MINUTE * 3) + '\n```'
    const html = `<figure><img src="/x.png" alt="${words(500)}"></figure>`
    const image = `![${words(500)}](/a.png)`
    expect(readingMinutes(`${words(100)}\n\n${code}\n\n${html}\n\n${image}`)).toBe(1)
  })

  test('counts accented Portuguese words and link text', () => {
    const body = Array.from({ length: WORDS_PER_MINUTE + 1 }, () => 'ação').join(' ')
    expect(readingMinutes(body)).toBe(2)
    expect(readingMinutes(`[${words(WORDS_PER_MINUTE + 1)}](https://x.com)`)).toBe(2)
  })
})
