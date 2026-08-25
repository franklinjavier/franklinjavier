import { describe, expect, test } from 'bun:test'
import { inventoryHtml, pruneCss } from '../src/lib/page-css'

const sample = `
:root{--font-sans:sans-serif}
.hidden{display:none}
.prose{max-width:65ch}
.prose h2{font-weight:700}
.xhome{padding:0}
.xpost{margin:1rem}
@keyframes page-reveal{to{opacity:1}}
::view-transition-new(root){animation:page-reveal}
html.theme-transition{animation:none}
@media (width >= 1024px){.xhome{font-size:4.5rem}.xpost{font-size:2rem}}
`

describe('pruneCss', () => {
  test('drops article and unused StyleX rules from a chrome page', () => {
    const need = inventoryHtml(
      '<html><body class="xhome"><p class="hidden">Hi</p><script>startViewTransition()</script></body></html>',
    )
    const css = pruneCss(sample, need)
    expect(css).toContain('.xhome')
    expect(css).toContain('.hidden')
    expect(css).toContain('page-reveal')
    expect(css).not.toContain('.prose')
    expect(css).not.toContain('.xpost')
    expect(css).not.toContain('theme-transition')
  })

  test('keeps prose on article pages', () => {
    const need = inventoryHtml('<div class="prose xpost"><h2>T</h2></div>')
    const css = pruneCss(sample, need)
    expect(css).toContain('.prose')
    expect(css).toContain('.xpost')
    expect(css).not.toContain('.xhome')
    expect(css).not.toContain('page-reveal')
  })
})
