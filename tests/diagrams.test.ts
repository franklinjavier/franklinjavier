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
