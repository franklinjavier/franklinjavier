// Unit tests for the inline diagram figures (src/diagrams).
import { describe, expect, test } from 'bun:test'
import { describeDiagrams, diagrams, placeholderName, renderFigure } from '../src/diagrams'
import { overflows } from '../src/diagrams/svg'

describe('diagrams', () => {
  test('render in both languages with labels that fit their boxes', () => {
    for (const name of Object.keys(diagrams)) {
      for (const lang of ['en', 'pt-br'] as const) {
        const figure = renderFigure(name, lang)
        expect(figure).toContain(`aria-labelledby="dg-${name}-${lang}-title dg-${name}-${lang}-desc"`)
        // No hard-coded colors: everything comes from classes and --dg-* tokens.
        expect(figure).not.toMatch(/(fill|stroke)="#/)
      }
    }
    expect(overflows).toEqual([])
  })

  test('keep every coordinate and size on the 4px grid', () => {
    const offGrid: string[] = []
    const check = (where: string, what: string, values: number[]) => {
      for (const v of values) if (v % 4 !== 0) offGrid.push(`${where}: ${what} ${v}`)
    }
    for (const name of Object.keys(diagrams)) {
      for (const lang of ['en', 'pt-br'] as const) {
        const svg = renderFigure(name, lang)
        const where = `${name}/${lang}`
        // x, y, width, height on rects, text and the svg itself (not markerWidth, refX…).
        for (const [, attr, v] of svg.matchAll(/ (x|y|width|height)="([^"]+)"/g)) check(where, attr, [Number(v)])
        for (const [, d] of svg.matchAll(/ d="([^"]+)"/g)) check(where, `path "${d}"`, d.match(/-?[\d.]+/g)!.map(Number))
        for (const [, p] of svg.matchAll(/ points="([^"]+)"/g)) {
          if (!svg.includes(`<polygon points="${p}" class="dg-mk`)) check(where, `points "${p}"`, p.match(/-?[\d.]+/g)!.map(Number))
        }
      }
    }
    expect(offGrid).toEqual([])
  })

  test('recognize only exact placeholders', () => {
    expect(placeholderName('<figure data-diagram="ladder"></figure>\n')).toBe('ladder')
    expect(placeholderName('<figure data-diagram="ladder">x</figure>')).toBeUndefined()
    expect(() => renderFigure('nope', 'en')).toThrow('Unknown diagram')
  })

  test('markdown twin swaps placeholders for the description', () => {
    const md = 'Before.\n\n<figure data-diagram="durable"></figure>\n\nAfter.'
    expect(describeDiagrams(md, 'pt-br')).toBe(
      `Before.\n\n*Diagrama: ${diagrams.durable.desc['pt-br']}*\n\nAfter.`,
    )
  })
})
