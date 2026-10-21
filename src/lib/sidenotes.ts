/**
 * Margin sidenotes for GFM footnotes, as progressive enhancement
 * (run by components/Sidenotes.astro, styled in prose.css).
 *
 * For each `sup > a[data-footnote-ref]` in `prose`, copies the whole footnote
 * (paragraphs, lists, quotes; minus the ↩ back-links and ids) into a
 * `.sidenote` floated into the right rail next to the reference, with its own
 * ↩ back to that reference. All or nothing: if any reference has no
 * footnote, a reference sits in a table, code block, figure or heading, a
 * footnote cites another footnote, or a footnote holds blocks that don't fit
 * a narrow rail (code, tables, images…), nothing changes and the normal
 * footnotes stay.
 *
 * On wide screens (`wide` matches) the notes show, the bottom footnotes
 * section hides (`.has-sidenotes`), and each reference's href and
 * aria-describedby point at its note. Below that the notes stay hidden and
 * the references point back at the original footnotes. A URL fragment for
 * whichever of the two is hidden (`#user-content-fn-*` on wide screens,
 * `#sidenote-*` below) is sent to the visible one on load, on hashchange and
 * when the breakpoint flips.
 */

/** Footnote children that can be moved into a sidenote as-is. */
const MOVABLE = new Set(['P', 'UL', 'OL', 'BLOCKQUOTE'])

const BACKREF = '[data-footnote-backref]'

/** Containers a sidenote can't sit beside a reference in. */
const BOXED = '.overflow-x-auto, pre, figure, h2, h3, table'

type Wide = Pick<MediaQueryList, 'matches' | 'addEventListener'>

interface Planned {
  ref: HTMLAnchorElement
  item: HTMLElement
}

/**
 * Returns the number of sidenotes created (0 when the page is left as is).
 * `signal` aborts the window and media-query listeners (client navigations).
 */
export function enhanceSidenotes(prose: Element, wide: Wide, signal?: AbortSignal): number {
  const doc = prose.ownerDocument
  const refs = [...prose.querySelectorAll<HTMLAnchorElement>('sup > a[data-footnote-ref]')]
  if (!refs.length) return 0

  const planned: Planned[] = []
  for (const ref of refs) {
    // Floats can't escape scroll boxes (tables, code) or headings.
    if (ref.closest(BOXED)) return 0
    const item = doc.getElementById(decodeURIComponent(ref.hash.slice(1)))
    if (!item || !canMove(item) || item.querySelector('a[data-footnote-ref]')) return 0
    planned.push({ ref, item })
  }

  const view = doc.defaultView
  // Flash and focus a note. Scroll only when it's off screen: a long note
  // before it (clear: right) can push it well below its reference.
  const reveal = (note: HTMLElement) => {
    note.classList.remove('is-target')
    note.getBoundingClientRect()
    note.classList.add('is-target')
    note.focus({ preventScroll: true })
    const box = note.getBoundingClientRect()
    if (view && (box.top < 0 || box.bottom > view.innerHeight)) {
      const reduce = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      note.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
    }
  }

  const notes = planned.map(({ ref, item }, index) => {
    const note = buildNote(doc, ref, item, `sidenote-${index + 1}`)
    // Right after the reference's paragraph (or list item).
    ;(ref.parentElement ?? ref).after(note)

    const original = {
      href: ref.getAttribute('href'),
      describedBy: ref.getAttribute('aria-describedby'),
    }
    const point = () => {
      if (wide.matches) {
        ref.setAttribute('href', `#${note.id}`)
        ref.setAttribute('aria-describedby', note.id)
      } else {
        restore(ref, 'href', original.href)
        restore(ref, 'aria-describedby', original.describedBy)
      }
    }
    point()
    wide.addEventListener('change', point, { signal })

    // The note sits beside the reference: flash and focus it instead of
    // letting the fragment jump scroll the page.
    ref.addEventListener(
      'click',
      (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
        if (!wide.matches) return
        event.preventDefault()
        reveal(note)
      },
      { signal },
    )
    return note
  })

  const follow = () => {
    let id = ''
    try {
      id = decodeURIComponent(view?.location.hash.slice(1) ?? '')
    } catch {
      return
    }
    if (wide.matches) {
      const index = planned.findIndex(({ item }) => item.id === id)
      if (index >= 0) reveal(notes[index])
    } else {
      const index = notes.findIndex((note) => note.id === id)
      if (index >= 0) planned[index].item.scrollIntoView()
    }
  }
  follow()
  view?.addEventListener('hashchange', follow, { signal })
  wide.addEventListener('change', follow, { signal })

  prose.classList.add('has-sidenotes')
  return planned.length
}

function canMove(item: Element): boolean {
  for (const node of item.childNodes) {
    if (node.nodeType === 3 && !node.textContent?.trim()) continue
    if (node.nodeType === 8) continue
    if (node.nodeType !== 1) return false
    const element = node as Element
    if (element.matches(BACKREF)) continue
    if (!MOVABLE.has(element.tagName)) return false
    if (element.querySelector('pre, table, img, figure, video, iframe')) return false
  }
  return true
}

function buildNote(doc: Document, ref: HTMLAnchorElement, item: Element, id: string) {
  const copy = item.cloneNode(true) as Element
  copy.querySelectorAll(BACKREF).forEach((link) => link.remove())
  copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'))

  const note = doc.createElement('span')
  note.className = 'sidenote'
  note.id = id
  note.setAttribute('role', 'note')
  note.tabIndex = -1
  note.append(...[...copy.childNodes].filter((node) => node.nodeType === 1))

  const number = doc.createElement('span')
  number.className = 'sidenote-number'
  number.textContent = ref.textContent
  const first = note.firstElementChild
  if (first?.tagName === 'P') first.prepend(number, ' ')
  else note.prepend(number)

  // Reuse the footnote's own back-link for this reference (keeps its label).
  const original = [...item.querySelectorAll(BACKREF)].find(
    (link) => ref.id && link.getAttribute('href') === `#${ref.id}`,
  )
  if (original) {
    const back = doc.createElement('a')
    back.className = 'sidenote-back'
    back.href = `#${ref.id}`
    const label = original.getAttribute('aria-label')
    if (label) back.setAttribute('aria-label', label)
    back.textContent = '↩'
    const last = note.lastElementChild
    if (last?.tagName === 'P') last.append(' ', back)
    else note.append(back)
  }
  return note
}

function restore(element: Element, name: string, value: string | null) {
  if (value === null) element.removeAttribute(name)
  else element.setAttribute(name, value)
}
