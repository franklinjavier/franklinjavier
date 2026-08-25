import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export type PageCssNeed = {
  classes: Set<string>
  tags: Set<string>
  hasProse: boolean
  hasViewTransition: boolean
}

const ALWAYS_CLASSES = new Set(['hidden', 'dark'])

export function inventoryHtml(html: string): PageCssNeed {
  const classes = new Set<string>()
  for (const value of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const name of value[1].split(/\s+/)) {
      if (name) classes.add(name)
    }
  }
  const tags = new Set<string>()
  for (const match of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)) {
    tags.add(match[1].toLowerCase())
  }
  return {
    classes,
    tags,
    hasProse: classes.has('prose'),
    hasViewTransition: html.includes('id="theme-toggle"'),
  }
}

export function splitCssRules(css: string): string[] {
  const rules: string[] = []
  const n = css.length
  let i = 0
  while (i < n) {
    while (i < n && /\s/.test(css[i] as string)) i += 1
    if (i >= n) break
    const start = i
    let depth = 0
    let quote: string | null = null
    for (; i < n; i += 1) {
      const char = css[i] as string
      if (quote) {
        if (char === '\\') {
          i += 1
          continue
        }
        if (char === quote) quote = null
        continue
      }
      if (char === '"' || char === "'") {
        quote = char
        continue
      }
      if (char === '{') depth += 1
      if (char === '}') {
        depth -= 1
        if (depth === 0) {
          i += 1
          rules.push(css.slice(start, i).trim())
          break
        }
      }
    }
    if (i === start) break
  }
  return rules.filter(Boolean)
}

function classNamesIn(selector: string): string[] {
  return [...selector.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map((match) => match[1])
}

function elementNamesIn(selector: string): string[] {
  return [...selector.matchAll(/(^|[\s>+~,])([a-z][a-z0-9]*)/gi)]
    .map((match) => match[2].toLowerCase())
    .filter((name) => name !== 'where' && name !== 'not' && name !== 'is' && name !== 'has')
}

function atBlockInner(rule: string): { prelude: string; inner: string } | null {
  const open = rule.indexOf('{')
  const close = rule.lastIndexOf('}')
  if (open === -1 || close === -1) return null
  return { prelude: rule.slice(0, open).trim(), inner: rule.slice(open + 1, close) }
}

function selectorNeeded(selector: string, need: PageCssNeed): boolean {
  const trimmed = selector.trim()
  if (!trimmed) return false
  if (
    trimmed === ':root' ||
    trimmed === '*' ||
    trimmed.startsWith('*:') ||
    trimmed.startsWith('*,')
  ) {
    return true
  }
  if (trimmed === 'html' || trimmed.startsWith('html:') || trimmed.startsWith('html,')) {
    return true
  }
  if (trimmed.includes('theme-transition')) {
    return need.classes.has('theme-transition')
  }
  if (trimmed.includes('::view-transition') || trimmed.includes('@keyframes')) {
    return need.hasViewTransition
  }
  if (trimmed.includes('.prose') || trimmed.includes('prose')) {
    return need.hasProse
  }

  const classes = classNamesIn(trimmed).filter((name) => !ALWAYS_CLASSES.has(name))
  if (classes.length > 0) {
    return classes.some((name) => need.classes.has(name))
  }

  const tags = elementNamesIn(trimmed)
  if (tags.length === 0) {
    return true
  }
  return tags.some((tag) => need.tags.has(tag))
}

export function pruneCss(css: string, need: PageCssNeed): string {
  const kept: string[] = []
  for (const rule of splitCssRules(css)) {
    if (rule.startsWith('@keyframes')) {
      const name = rule.slice('@keyframes'.length).trim().split(/[\s{]/)[0]
      if (name === 'page-reveal' || name === 'reveal-dark' || name === 'reveal-light') {
        if (need.hasViewTransition) kept.push(rule)
      } else if (name === 'glitch') {
        if (need.classes.has('glitch')) kept.push(rule)
      }
      continue
    }
    if (rule.startsWith('@media') || rule.startsWith('@supports')) {
      const block = atBlockInner(rule)
      if (!block) continue
      const inner = pruneCss(block.inner, need).trim()
      if (inner) kept.push(`${block.prelude}{${inner}}`)
      continue
    }
    const prelude = rule.slice(0, rule.indexOf('{')).trim()
    const parts = prelude.split(',')
    if (parts.some((part) => selectorNeeded(part, need))) {
      kept.push(rule)
    }
  }
  return kept.join('')
}

export function cssContentHash(css: string): string {
  return createHash('sha256').update(css).digest('hex').slice(0, 10)
}

function stylesheetHrefs(html: string): string[] {
  return [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
    .map((match) => match[0].match(/href="([^"]+\.css)"/)?.[1])
    .filter((href): href is string => Boolean(href))
}

export function applyPageCss(distDir: string): { pages: number; sheets: number } {
  const htmlFiles: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.html')) htmlFiles.push(path)
    }
  }
  walk(distDir)

  const astroDir = join(distDir, '_astro')
  mkdirSync(astroDir, { recursive: true })
  const written = new Map<string, string>()
  const referenced = new Set<string>()

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf-8')
    const hrefs = stylesheetHrefs(html)
    if (hrefs.length === 0) continue
    const combined = hrefs
      .map((href) => readFileSync(join(distDir, href.replace(/^\//, '')), 'utf-8'))
      .join('\n')
    const pruned = pruneCss(combined, inventoryHtml(html))
    const hash = cssContentHash(pruned)
    const fileName = `p-${hash}.css`
    const rel = `/_astro/${fileName}`
    if (!written.has(hash)) {
      writeFileSync(join(astroDir, fileName), pruned)
      written.set(hash, rel)
    }
    referenced.add(rel)
    let next = html
    const first = hrefs[0]
    next = next.replace(`href="${first}"`, `href="${rel}"`)
    for (const href of hrefs.slice(1)) {
      next = next.replace(
        new RegExp(`\\s*<link[^>]+href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`),
        '',
      )
    }
    if (next !== html) writeFileSync(file, next)
  }

  for (const entry of readdirSync(astroDir)) {
    if (!entry.endsWith('.css')) continue
    if (!referenced.has(`/_astro/${entry}`)) {
      unlinkSync(join(astroDir, entry))
    }
  }

  return { pages: htmlFiles.length, sheets: written.size }
}
