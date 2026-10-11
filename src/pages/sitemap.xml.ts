import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getPublishedPosts, getTrustPages, trustPageUrl, toPostSummary } from '../lib/content'
import { hreflangLinks, translationPair, type TranslationPair } from '../lib/alternates'
import { SITE_URL } from '../lib/site'
import type { Lang } from '../lib/markdown'

// Tag pages are left out on purpose: they are thin listings marked
// noindex,follow (BlogByTag), so listing them here would contradict that.
// Every URL with a translation carries its hreflang alternates, the same
// pairs BaseLayout puts in the page head.

interface SitemapEntry {
  url: string
  /** Omitted when there is no real edit date (never the build time). */
  lastmod?: Date
  pair?: TranslationPair
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const lastEdit = (post: CollectionEntry<'blog'>) => post.data.updated ?? post.data.date
const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'pt-br' : 'en')

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts()
  const pages = await getTrustPages()
  const langs: Lang[] = ['en', 'pt-br']
  const prefix = (lang: Lang) => (lang === 'en' ? '' : '/pt-br')

  const newestEdit = (lang: Lang) =>
    posts
      .filter((post) => post.data.lang === lang)
      .reduce((latest, post) => (lastEdit(post) > latest ? lastEdit(post) : latest), new Date(0))

  const entries: SitemapEntry[] = []

  for (const lang of langs) {
    for (const path of ['/', '/blog/', '/speaking/']) {
      const pair = translationPair(
        lang,
        `${prefix(lang)}${path}`,
        `${prefix(otherLang(lang))}${path}`,
      )
      // Home and blog index change when a post in their language does.
      const lastmod = path === '/speaking/' ? undefined : newestEdit(lang)
      entries.push({ url: `${prefix(lang)}${path}`, lastmod, pair })
    }
  }

  for (const post of posts) {
    const url = toPostSummary(post).url
    const translation = post.data.translationKey
      ? posts.find(
          (other) =>
            other.data.translationKey === post.data.translationKey &&
            other.data.lang !== post.data.lang,
        )
      : undefined
    const pair = translation
      ? translationPair(post.data.lang, url, toPostSummary(translation).url)
      : undefined
    entries.push({ url, lastmod: lastEdit(post), pair })
  }

  for (const page of pages) {
    const lang = page.data.lang
    const slug = page.id.replace(/^pt-br\//, '')
    const translation = pages.find(
      (other) => other.data.lang !== lang && other.id.replace(/^pt-br\//, '') === slug,
    )
    const pair = translation
      ? translationPair(lang, trustPageUrl(page), trustPageUrl(translation))
      : undefined
    entries.push({ url: trustPageUrl(page), lastmod: page.data.updated, pair })
  }

  const urlset = entries
    .map((entry) => {
      const lines = [`    <loc>${escapeXml(new URL(entry.url, SITE_URL).href)}</loc>`]
      if (entry.lastmod)
        lines.push(`    <lastmod>${entry.lastmod.toISOString().slice(0, 10)}</lastmod>`)
      for (const link of hreflangLinks(entry.pair)) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${escapeXml(link.href)}"/>`,
        )
      }
      return `  <url>\n${lines.join('\n')}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlset}\n</urlset>\n`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
