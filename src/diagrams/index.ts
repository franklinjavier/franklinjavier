// Inline SVG diagrams for markdown posts. A post marks a spot with
//   <figure data-diagram="architecture"></figure>
// on its own line; the hast plugin in ./plugin.ts swaps it for the figure in
// the post's language, and the markdown twin swaps it for the description.

import { architecture } from './architecture'
import { durable } from './durable'
import { helpers } from './helpers'
import { ladder } from './ladder'
import { lifecycle } from './lifecycle'
import { promptCache } from './prompt-cache'
import { esc, svg, type Diagram, type Lang } from './svg'
import { wakeups } from './wakeups'

export type { Lang }

export const diagrams: Record<string, Diagram> = {
  architecture,
  lifecycle,
  wakeups,
  durable,
  ladder,
  helpers,
  'prompt-cache': promptCache,
}

const credit = {
  en: 'source: Lee Robinson, CS146S',
  'pt-br': 'fonte: Lee Robinson, CS146S',
}

const PLACEHOLDER = /^[ \t]*<figure data-diagram="([a-z-]+)"><\/figure>[ \t]*$/gm

/** The diagram name if `html` is exactly one placeholder, else undefined. */
export function placeholderName(html: string): string | undefined {
  return /^\s*<figure data-diagram="([a-z-]+)"><\/figure>\s*$/.exec(html)?.[1]
}

function lookup(name: string): Diagram {
  const diagram = diagrams[name]
  if (!diagram) throw new Error(`Unknown diagram "${name}" (known: ${Object.keys(diagrams).join(', ')})`)
  return diagram
}

/** The `<figure>` with the inline SVG and a localized caption. */
export function renderFigure(name: string, lang: Lang): string {
  const diagram = lookup(name)
  const id = `dg-${name}-${lang}`
  const { height, body } = diagram.draw(lang, id)
  const svgMarkup = svg({ id, height, title: diagram.title[lang], desc: diagram.desc[lang], body })
  const source = diagram.lecture ? ` <span class="diagram-credit">${credit[lang]}</span>` : ''
  return `<figure class="diagram" data-diagram="${name}">${svgMarkup}<figcaption>${esc(diagram.caption[lang])}${source}</figcaption></figure>`
}

/** Markdown: each placeholder line becomes a one-line description. */
export function describeDiagrams(markdown: string, lang: Lang): string {
  const prefix = lang === 'en' ? 'Diagram' : 'Diagrama'
  return markdown.replace(PLACEHOLDER, (_, name: string) => `*${prefix}: ${lookup(name).desc[lang]}*`)
}
