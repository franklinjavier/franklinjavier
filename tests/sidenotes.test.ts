// Runs the sidenote enhancement (src/lib/sidenotes.ts) against footnote
// markup rendered by Astro's markdown processor. No real post has footnotes,
// so the fixtures render here.
import { describe, expect, test } from 'bun:test'
import { Window } from 'happy-dom'
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri'
import { enhanceSidenotes } from '../src/lib/sidenotes'
import { tocItems } from '../src/lib/toc'

const mixed = `## One

A claim.[^1] Again.[^1] Another.[^note]

## Two

Text.

[^1]: First *note* with a [link](https://example.com).

    Second paragraph.

    - a list item
    > a quote

[^note]: Second note.
`

const withCode = `Claim.[^1] Plain.[^2]

[^1]: Plain note.
[^2]: Has code:

    \`\`\`js
    run()
    \`\`\`
`

const nested = `Claim.[^a]

[^a]: A note citing another.[^b]
[^b]: The other note.
`

const inTable = `Claim.[^1]

| Column |
| ------ |
| Cell.[^2] |

[^1]: Plain note.
[^2]: Note from a cell.
`

async function render(source: string) {
  const processor = await createSatteriMarkdownProcessor({ syntaxHighlight: false })
  const result = await processor.render(source)
  return { html: result.code as string, headings: result.metadata.headings }
}

/** A matchMedia stand-in whose state the test flips. */
function media(matches: boolean) {
  const listeners: (() => void)[] = []
  return {
    matches,
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    set(next: boolean) {
      this.matches = next
      listeners.forEach((listener) => listener())
    },
  }
}

async function page(source: string, wide = true, hash = '') {
  const { html } = await render(source)
  const window = new Window({ url: `https://example.com/blog/post/${hash}` })
  const document = window.document as unknown as Document
  document.body.innerHTML = `<div class="prose" data-sidenotes>${html}</div>`
  const prose = document.querySelector('[data-sidenotes]')!
  const mq = media(wide)
  const count = enhanceSidenotes(prose, mq as unknown as MediaQueryList)
  const refs = [...prose.querySelectorAll<HTMLAnchorElement>('a[data-footnote-ref]')]
  const notes = [...prose.querySelectorAll<HTMLElement>('.sidenote')]
  return { document, prose, mq, count, refs, notes, window }
}

const text = (node: Element) => node.textContent!.replace(/\s+/g, ' ').trim()

describe('sidenote enhancement', () => {
  test('copies every block of each footnote, one note per reference', async () => {
    const { count, notes, prose, refs } = await page(mixed)
    expect(count).toBe(3)
    expect(notes).toHaveLength(refs.length)
    const [first, repeat, second] = notes
    expect(first.querySelectorAll('p')).toHaveLength(3)
    expect(first.querySelector('em')?.textContent).toBe('note')
    expect(first.querySelector('a[href="https://example.com"]')).not.toBeNull()
    expect(first.querySelector('ul > li')?.textContent).toBe('a list item')
    expect(text(first.querySelector('blockquote')!)).toBe('a quote')
    expect(text(first)).toStartWith('1 First note with a link.')
    expect(text(repeat)).toBe(text(first))
    expect(text(second)).toStartWith('2 Second note.')
    // No duplicate ids from the copies; originals untouched.
    expect(first.querySelector('[id]')).toBeNull()
    expect(prose.querySelector('section[data-footnotes] li ul')).not.toBeNull()
    expect(prose.classList.contains('has-sidenotes')).toBe(true)
  })

  test('on wide screens references point at their notes, and notes link back', async () => {
    const { refs, notes } = await page(mixed)
    refs.forEach((ref, index) => {
      const note = notes[index]
      expect(ref.getAttribute('href')).toBe(`#${note.id}`)
      expect(ref.getAttribute('aria-describedby')).toBe(note.id)
      const back = note.querySelector<HTMLAnchorElement>('a.sidenote-back')!
      expect(back.getAttribute('href')).toBe(`#${ref.id}`)
      expect(back.getAttribute('aria-label')).toStartWith('Back to reference')
      // The ref sits right before its note (same paragraph).
      expect(ref.parentElement!.nextElementSibling).toBe(note)
    })
  })

  test('narrow screens restore the original footnote destinations', async () => {
    const { refs, mq } = await page(mixed)
    mq.set(false)
    for (const ref of refs) {
      expect(ref.getAttribute('href')).toMatch(/^#user-content-fn-/)
      expect(ref.getAttribute('aria-describedby')).toBe('footnote-label')
    }
    mq.set(true)
    expect(refs[0].getAttribute('href')).toBe('#sidenote-1')
  })

  test('starting narrow keeps the originals until the screen widens', async () => {
    const { refs, mq, prose } = await page(mixed, false)
    expect(refs[0].getAttribute('href')).toBe('#user-content-fn-1')
    expect(prose.classList.contains('has-sidenotes')).toBe(true)
    mq.set(true)
    expect(refs[0].getAttribute('href')).toBe('#sidenote-1')
  })

  test('a footnote with a code block leaves the page untouched', async () => {
    const { count, notes, prose, refs } = await page(withCode)
    expect(count).toBe(0)
    expect(notes).toHaveLength(0)
    expect(prose.classList.contains('has-sidenotes')).toBe(false)
    expect(refs[0].getAttribute('href')).toBe('#user-content-fn-1')
  })

  test('a reference inside a table leaves the page untouched', async () => {
    const { count, notes, prose, refs } = await page(inTable)
    expect(refs).toHaveLength(2)
    expect(refs[1].closest('table')).not.toBeNull()
    expect(count).toBe(0)
    expect(notes).toHaveLength(0)
    expect(prose.classList.contains('has-sidenotes')).toBe(false)
    expect(refs[0].getAttribute('href')).toBe('#user-content-fn-1')
  })

  test('a reference without a footnote leaves the page untouched', async () => {
    const { html } = await render(mixed)
    const window = new Window()
    const document = window.document as unknown as Document
    document.body.innerHTML = `<div data-sidenotes>${html}</div>`
    document.getElementById('user-content-fn-note')!.remove()
    const prose = document.querySelector('[data-sidenotes]')!
    expect(enhanceSidenotes(prose, media(true) as unknown as MediaQueryList)).toBe(0)
    expect(prose.querySelector('.sidenote')).toBeNull()
    expect(prose.classList.contains('has-sidenotes')).toBe(false)
  })

  test('a click on wide screens focuses the note instead of jumping', async () => {
    const { refs, notes, document, window } = await page(mixed)
    const click = new window.MouseEvent('click', { bubbles: true, cancelable: true })
    refs[2].dispatchEvent(click as unknown as Event)
    expect(click.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(notes[2])
    expect(notes[2].classList.contains('is-target')).toBe(true)
  })

  test('a footnote citing another footnote leaves the page untouched', async () => {
    const { count, notes, prose, refs } = await page(nested)
    expect(refs.length).toBeGreaterThan(1)
    expect(count).toBe(0)
    expect(notes).toHaveLength(0)
    expect(prose.classList.contains('has-sidenotes')).toBe(false)
    expect(refs[0].getAttribute('href')).toBe('#user-content-fn-a')
  })

  test('modified or non-primary clicks keep the native link behaviour', async () => {
    const { refs, notes, document, window } = await page(mixed)
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { button: 1 }]) {
      const click = new window.MouseEvent('click', { bubbles: true, cancelable: true, ...init })
      refs[0].dispatchEvent(click as unknown as Event)
      expect(click.defaultPrevented).toBe(false)
    }
    expect(document.activeElement).not.toBe(notes[0])
  })

  test('a click scrolls the note into view only when it is off screen', async () => {
    const { refs, notes, window } = await page(mixed)
    const scrolls: unknown[] = []
    notes[2].scrollIntoView = ((options: unknown) => scrolls.push(options)) as never
    const click = () =>
      refs[2].dispatchEvent(
        new window.MouseEvent('click', { bubbles: true, cancelable: true }) as unknown as Event,
      )
    click()
    expect(scrolls).toHaveLength(0)
    notes[2].getBoundingClientRect = () => ({ top: 2000, bottom: 2100 }) as DOMRect
    click()
    expect(scrolls).toHaveLength(1)
  })

  test('fragments for the hidden destination go to the visible one', async () => {
    // Wide: an original footnote URL opens its (first) sidenote.
    const wide = await page(mixed, true, '#user-content-fn-note')
    expect(wide.document.activeElement).toBe(wide.notes[2])

    // Narrow: a sidenote URL scrolls to the original footnote, also after
    // the breakpoint flips and on hashchange.
    const narrow = await page(mixed, false)
    const item = narrow.document.getElementById('user-content-fn-1')!
    let scrolled = 0
    item.scrollIntoView = () => void scrolled++
    narrow.window.location.hash = '#sidenote-2'
    narrow.window.dispatchEvent(new narrow.window.Event('hashchange'))
    expect(scrolled).toBeGreaterThan(0)
    scrolled = 0
    narrow.mq.set(true)
    expect(scrolled).toBe(0)
    narrow.mq.set(false)
    expect(scrolled).toBe(1)
  })

  test('the hidden "Footnotes" heading stays out of the TOC', async () => {
    const { headings } = await render(mixed)
    expect(headings.map((h: { slug: string }) => h.slug)).toContain('footnote-label')
    expect(tocItems(headings).map((item) => item.slug)).toEqual(['one', 'two'])
  })
})
