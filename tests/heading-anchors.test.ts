import { describe, expect, test } from 'bun:test'
import type { MarkdownHeading } from 'astro'
import { addHeadingAnchors } from '../src/lib/heading-anchors'
import { ui } from '../src/i18n/ui'

const headings: MarkdownHeading[] = [
  { depth: 2, slug: 'why-it-matters', text: 'Why "it" matters' },
  { depth: 3, slug: 'código', text: 'Código' },
  { depth: 4, slug: 'deep', text: 'Deep' },
  { depth: 2, slug: 'footnote-label', text: 'Footnotes' },
]

describe('addHeadingAnchors', () => {
  const html = [
    '<h2 id="why-it-matters">Why “it” <code>matters</code></h2>',
    '<p>Body</p>',
    '<h3 id="código">Código</h3>',
    '<h4 id="deep">Deep</h4>',
    '<h2 class="sr-only" id="footnote-label">Footnotes</h2>',
  ].join('')
  const out = addHeadingAnchors(html, headings, 'Copy link to section:')

  test('links each h2/h3 to its existing id with the heading text as label', () => {
    expect(out).toContain(
      '<h2 id="why-it-matters">Why “it” <code>matters</code><a class="heading-anchor" href="#why-it-matters" aria-label="Copy link to section: Why &quot;it&quot; matters" data-heading-anchor><span aria-hidden="true">#</span></a></h2>',
    )
    expect(out).toContain('<h3 id="código">Código<a class="heading-anchor" href="#código"')
  })

  test('leaves h4 and the hidden footnotes heading alone', () => {
    expect(out).toContain('<h4 id="deep">Deep</h4>')
    expect(out).toContain('<h2 class="sr-only" id="footnote-label">Footnotes</h2>')
    expect(out.match(/data-heading-anchor/g)).toHaveLength(2)
  })
})

describe('heading link strings', () => {
  test('exist in both languages', () => {
    expect(ui.en['blog.copySectionLink']).toBe('Copy link to section:')
    expect(ui.en['blog.linkCopied']).toBe('Link copied')
    expect(ui['pt-br']['blog.copySectionLink']).toBe('Copiar link da seção:')
    expect(ui['pt-br']['blog.linkCopied']).toBe('Link copiado')
  })
})
