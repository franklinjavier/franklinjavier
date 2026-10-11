// hreflang alternates for pages that exist in both languages. BaseLayout
// emits them as <link rel="alternate" hreflang> and sitemap.xml.ts as
// <xhtml:link>; both read the same pairs, so the head and the sitemap agree.

import { SITE_URL } from './site'
import type { Lang } from './markdown'

export interface HreflangLink {
  hreflang: 'en' | 'pt-BR' | 'x-default'
  href: string
}

/** Site paths of one page in each language. */
export type TranslationPair = Record<Lang, string>

/**
 * The pair for a page at `path` in `lang` whose translation lives at
 * `translationPath`, or undefined when it has none.
 */
export function translationPair(
  lang: Lang,
  path: string,
  translationPath: string | null | undefined,
): TranslationPair | undefined {
  if (!translationPath) return undefined
  return lang === 'en'
    ? { en: path, 'pt-br': translationPath }
    : { en: translationPath, 'pt-br': path }
}

/** en, pt-BR and x-default (the English page), as absolute URLs. */
export function hreflangLinks(pair: TranslationPair | undefined): HreflangLink[] {
  if (!pair) return []
  const en = new URL(pair.en, SITE_URL).href
  return [
    { hreflang: 'en', href: en },
    { hreflang: 'pt-BR', href: new URL(pair['pt-br'], SITE_URL).href },
    { hreflang: 'x-default', href: en },
  ]
}
