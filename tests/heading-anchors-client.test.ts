// Runs the section-link click handler (createHeadingAnchorHandler in
// src/lib/heading-anchors.ts) in happy-dom with stubbed clipboard methods.
import { describe, expect, test } from 'bun:test'
import { Window } from 'happy-dom'
import { createHeadingAnchorHandler } from '../src/lib/heading-anchors'

interface Options {
  writeText?: (text: string) => Promise<void>
  execCommand?: () => boolean
}

function setup({ writeText, execCommand = () => false }: Options = {}) {
  const window = new Window({ url: 'https://example.com/blog/post/' })
  const document = window.document as unknown as Document
  document.body.innerHTML = `
    <div class="prose">
      <h2 id="one">One<a class="heading-anchor" href="#one" data-heading-anchor><span aria-hidden="true">#</span></a></h2>
    </div>
    <p data-heading-anchor-status data-message="Link copied" data-error-message="Couldn't copy" aria-live="polite"></p>`
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
  const execCalls: string[] = []
  document.execCommand = (command: string) => {
    execCalls.push(command)
    return execCommand()
  }
  const handler = createHeadingAnchorHandler(document)
  let pending: Promise<void> = Promise.resolve()
  document.addEventListener('click', (event) => (pending = handler(event)))
  const link = document.querySelector<HTMLAnchorElement>('a[data-heading-anchor]')!
  const status = document.querySelector<HTMLElement>('[data-heading-anchor-status]')!
  const click = async (
    init: {
      button?: number
      metaKey?: boolean
      ctrlKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
    } = {},
  ) => {
    const event = new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ...init,
    }) as unknown as Event
    link.dispatchEvent(event)
    await pending
    // Let the announcement's animation frame run.
    await new Promise((resolve) => setTimeout(resolve, 30))
    return event
  }
  return { window, link, status, click, execCalls }
}

describe('createHeadingAnchorHandler', () => {
  test('copies the full URL, updates the hash and announces success', async () => {
    const written: string[] = []
    const { window, link, status, click, execCalls } = setup({
      writeText: async (text) => void written.push(text),
    })
    const event = await click()
    expect(event.defaultPrevented).toBe(true)
    expect(written).toEqual(['https://example.com/blog/post/#one'])
    expect(execCalls).toEqual([])
    expect(window.location.hash).toBe('#one')
    expect(link.dataset.copied).toBe('')
    expect(status.textContent).toBe('Link copied')
  })

  test('falls back to execCommand when writeText rejects', async () => {
    const { status, click, execCalls } = setup({
      writeText: () => Promise.reject(new Error('denied')),
      execCommand: () => true,
    })
    await click()
    expect(execCalls).toEqual(['copy'])
    expect(status.textContent).toBe('Link copied')
  })

  test('announces the failure when both methods fail, keeping the hash', async () => {
    const { window, link, status, click, execCalls } = setup({
      writeText: () => Promise.reject(new Error('denied')),
      execCommand: () => false,
    })
    await click()
    expect(execCalls).toEqual(['copy'])
    expect(window.location.hash).toBe('#one')
    expect(link.dataset.copied).toBeUndefined()
    expect(status.textContent).toBe("Couldn't copy")
  })

  test('announces the failure when there is no clipboard API and execCommand throws', async () => {
    const { status, click } = setup({
      execCommand: () => {
        throw new Error('unsupported')
      },
    })
    await click()
    expect(status.textContent).toBe("Couldn't copy")
  })

  test('clears the region before each copy so repeats are announced again', async () => {
    const { status, click } = setup({ writeText: async () => {} })
    const seen: string[] = []
    const observer = new (status.ownerDocument.defaultView as unknown as Window).MutationObserver(
      () => seen.push(status.textContent ?? ''),
    )
    observer.observe(status as never, { childList: true, characterData: true, subtree: true })
    await click()
    await click()
    observer.disconnect()
    expect(status.textContent).toBe('Link copied')
    expect(seen.filter((text) => text === 'Link copied')).toHaveLength(2)
    expect(seen.lastIndexOf('')).toBeGreaterThan(seen.indexOf('Link copied'))
  })

  test('ignores modified and non-primary clicks', async () => {
    const written: string[] = []
    const { status, click } = setup({
      writeText: async (text) => void written.push(text),
    })
    for (const init of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      const event = await click(init)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(written).toEqual([])
    expect(status.textContent).toBe('')
  })
})
