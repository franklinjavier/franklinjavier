import type { MarkdownHeading } from 'astro'
import { tocHeadings } from './toc'

const escapeAttr = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

/**
 * Appends a "#" link to every TOC heading (h2/h3) in a post's rendered HTML.
 * Ids come from Astro's slugger, the same ones `render()` reports in
 * `headings` and the TOC links to; nothing is re-slugged here. The heading
 * text for the aria-label comes from that data too, so the TOC labels and
 * the markdown twins never see the glyph.
 */
export function addHeadingAnchors(
  html: string,
  headings: MarkdownHeading[],
  labelPrefix: string,
): string {
  const titles = new Map(tocHeadings(headings).map((heading) => [heading.slug, heading.text]))
  return html.replace(
    /<h([23])\b([^>]*\sid="([^"]+)"[^>]*)>([\s\S]*?)<\/h\1>/g,
    (match, level: string, attrs: string, id: string, inner: string) => {
      const text = titles.get(id)
      if (text === undefined) return match
      const label = escapeAttr(`${labelPrefix} ${text}`)
      return `<h${level}${attrs}>${inner}<a class="heading-anchor" href="#${id}" aria-label="${label}" data-heading-anchor><span aria-hidden="true">#</span></a></h${level}>`
    },
  )
}

// execCommand fallback for browsers (or insecure origins) without the
// async clipboard API.
function legacyCopy(doc: Document, text: string): boolean {
  const active = doc.activeElement as HTMLElement | null
  const field = doc.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
  doc.body.append(field)
  field.select()
  let copied = false
  try {
    copied = doc.execCommand('copy')
  } catch {
    copied = false
  }
  field.remove()
  active?.focus({ preventScroll: true })
  return copied
}

async function copyText(doc: Document, text: string): Promise<boolean> {
  const clipboard = doc.defaultView?.navigator.clipboard
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      // Permission denied or not focused: try the old way.
    }
  }
  return legacyCopy(doc, text)
}

/**
 * Client side of the section links: returns a click handler (for
 * `document`) that, on a plain primary click of a `#` link, updates the hash
 * without the native jump, copies the full URL and announces the result
 * through the `[data-heading-anchor-status]` live region (`data-message` on
 * success, `data-error-message` when both clipboard methods fail; the URL is
 * then still in the address bar). The region is read at click time, so one
 * document listener keeps working after the body is swapped. Resolves once
 * the click is handled.
 */
export function createHeadingAnchorHandler(doc: Document) {
  const win = doc.defaultView!
  const timers = new WeakMap<HTMLElement, number>()
  let clearStatus = 0

  const announce = (status: HTMLElement | null, message: string | undefined) => {
    if (!status || !message) return
    // Clear first so a repeated message is announced again.
    status.textContent = ''
    win.clearTimeout(clearStatus)
    win.requestAnimationFrame(() => {
      status.textContent = message
      clearStatus = win.setTimeout(() => (status.textContent = ''), 5000)
    })
  }

  return async (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      'a[data-heading-anchor]',
    )
    if (!link) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    // Update the address bar without the native jump to the heading.
    // Keep the router's history state: pushState(null) makes Back a no-op
    // for ClientRouter, so the URL moves and the page does not.
    const state = win.history.state
    if (win.location.hash === link.hash) win.history.replaceState(state, '', link.hash)
    else win.history.pushState(state, '', link.hash)
    const status = doc.querySelector<HTMLElement>('[data-heading-anchor-status]')
    if (!(await copyText(doc, link.href))) {
      announce(status, status?.dataset.errorMessage)
      return
    }
    // Brief check-mark cue (prose.css); the animation is skipped for reduced motion.
    win.clearTimeout(timers.get(link))
    link.dataset.copied = ''
    timers.set(
      link,
      win.setTimeout(() => delete link.dataset.copied, 1600),
    )
    announce(status, status?.dataset.message)
  }
}
