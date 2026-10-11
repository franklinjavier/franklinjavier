// SVG building blocks for the post diagrams. Every shape gets a class instead
// of a color; the colors live in prose.css as --dg-* tokens that flip under
// .dark. Geometry stays on a 4px grid; the viewBox is 352 wide so 12px text
// still renders at 10px+ in a 360px-wide phone viewport.

export type Lang = 'en' | 'pt-br'

export const WIDTH = 352

export type Localized<T> = Record<Lang, T>

export function esc(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// Rough advance widths (px per character) used to catch labels that would not
// fit their box. Deliberately on the wide side of common system fonts.
const ADVANCE = { name: 9, small: 6.8, mono: 7.2, eyebrow: 7.9 } as const
type TextKind = keyof typeof ADVANCE

/** Labels whose estimated width exceeds their slot; checked by the tests. */
export const overflows: string[] = []

function fit(text: string, kind: TextKind, room: number): void {
  if (text.length * ADVANCE[kind] > room) overflows.push(`"${text}" needs more than ${room}px`)
}

type Anchor = 'start' | 'middle' | 'end'

function text(x: number, y: number, value: string, cls: string, anchor: Anchor = 'middle'): string {
  return `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`
}

export type NodeKind = 'node' | 'focal' | 'input' | 'store' | 'ghost'

export interface NodeOptions {
  x: number
  y: number
  w: number
  h: number
  name?: string
  sub?: string
  kind?: NodeKind
  rx?: number
  /** Left-align the text this far from the box's left edge instead of centering it. */
  left?: number
  /** Use the 12px sans name (source pills) instead of the 16px one. */
  small?: boolean
}

/** `[name, sub]` label pair → node options. */
export function ns([name, sub]: readonly string[]): Pick<NodeOptions, 'name' | 'sub'> {
  return { name, sub }
}

/** A box: opaque paper underlay, styled rect, name (sans) and sublabel (mono). */
export function node(o: NodeOptions): string {
  const kind = o.kind ?? 'node'
  const rx = o.rx ?? 6
  const tx = o.left ? o.x + o.left : o.x + o.w / 2
  const anchor: Anchor = o.left ? 'start' : 'middle'
  const room = o.left ? o.w - o.left - 8 : o.w - 8
  const nameCls = (o.small ? 'dg-small' : 'dg-name') + (kind === 'ghost' ? ' dg-faint' : '')
  const parts = [
    `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="${rx}" class="dg-under"/>`,
    `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="${rx}" class="dg-${kind}"/>`,
  ]
  const cy = o.y + o.h / 2
  if (o.name && o.sub) {
    fit(o.name, 'name', room)
    fit(o.sub, 'mono', room)
    parts.push(text(tx, cy - 4, o.name, nameCls, anchor))
    parts.push(text(tx, cy + 12, o.sub, 'dg-sub', anchor))
  } else if (o.name) {
    fit(o.name, o.small ? 'small' : 'name', room)
    parts.push(text(tx, cy + 4, o.name, nameCls, anchor))
  }
  return parts.join('')
}

/** A decision diamond centered at (cx, cy) with a one-line question. */
export function diamond(cx: number, cy: number, hw: number, hh: number, question: string, kind: NodeKind = 'node'): string {
  const points = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
  // Width available to a 16px line at the diamond's middle.
  fit(question, 'name', 2 * hw * (1 - 8 / hh) - 8)
  return (
    `<polygon points="${points}" class="dg-under"/>` +
    `<polygon points="${points}" class="dg-${kind}"/>` +
    text(cx, cy + 4, question, 'dg-name')
  )
}

/** Several lines of mono text centered at x, first baseline at y, 16px apart. */
export function lines(x: number, y: number, values: string[], room: number, cls = 'dg-sub'): string {
  return values
    .map((value, i) => {
      fit(value, 'mono', room)
      return text(x, y + i * 16, value, cls)
    })
    .join('')
}

/** A single centered 16px name for a box drawn without one (e.g. the router). */
export function name(x: number, y: number, value: string, room: number, cls = 'dg-name'): string {
  fit(value, 'name', room)
  return text(x, y, value, cls)
}

/** Uppercase mono eyebrow for zones and groups. */
export function eyebrow(x: number, y: number, value: string, anchor: Anchor = 'start'): string {
  return text(x, y, value, 'dg-eyebrow', anchor)
}

/** A connector. `accent` marks the focal flow; `dashed` a passive one. */
export function path(id: string, d: string, style: 'muted' | 'accent' | 'dashed' = 'muted', arrow = true): string {
  const marker = arrow ? ` marker-end="url(#${id}-${style === 'accent' ? 'arrow-accent' : 'arrow'})"` : ''
  return `<path d="${d}" class="dg-line dg-line-${style}"${marker}/>`
}

/**
 * A masked arrow label beside a vertical segment at x (side 'right' or
 * 'left'), or above a horizontal one at y (side 'above'), with an 8px gap
 * between the mask and the stroke.
 */
export function label(
  value: string,
  side: 'right' | 'left' | 'above' | 'below',
  at: { x: number; y: number },
  accent = false,
): string {
  const w = Math.ceil((value.length * ADVANCE.mono + 8) / 8) * 8
  const cls = accent ? 'dg-label dg-label-accent' : 'dg-label'
  let mx: number
  let my: number
  if (side === 'right' || side === 'left') {
    mx = side === 'right' ? at.x + 8 : at.x - 8 - w
    my = at.y - 8
  } else {
    mx = at.x - w / 2
    my = side === 'above' ? at.y - 24 : at.y + 8
  }
  return (
    `<rect x="${mx}" y="${my}" width="${w}" height="16" rx="2" class="dg-mask"/>` +
    text(mx + w / 2, my + 12, value, cls)
  )
}

export interface Diagram {
  title: Localized<string>
  /** One sentence; also the text that replaces the diagram in the .md twin. */
  desc: Localized<string>
  caption: Localized<string>
  /** Redrawn from a slide in Lee Robinson's lecture: adds the credit line. */
  lecture: boolean
  /** `id` prefixes every SVG id (diagram + language) so figures never collide. */
  draw(lang: Lang, id: string): { height: number; body: string[] }
}

export interface SvgOptions {
  id: string
  height: number
  title: string
  desc: string
  body: string[]
}

/** The accessible SVG: title first, then desc, defs, and the drawing. */
export function svg(o: SvgOptions): string {
  const marker = (suffix: string, cls: string) =>
    `<marker id="${o.id}-${suffix}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" class="${cls}"/></marker>`
  return [
    `<svg viewBox="0 0 ${WIDTH} ${o.height}" width="${WIDTH}" height="${o.height}" role="img" aria-labelledby="${o.id}-title ${o.id}-desc" xmlns="http://www.w3.org/2000/svg">`,
    `<title id="${o.id}-title">${esc(o.title)}</title>`,
    `<desc id="${o.id}-desc">${esc(o.desc)}</desc>`,
    `<defs>${marker('arrow', 'dg-mk')}${marker('arrow-accent', 'dg-mk-accent')}</defs>`,
    ...o.body,
    `</svg>`,
  ].join('')
}
