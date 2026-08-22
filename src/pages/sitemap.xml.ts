import type { APIRoute } from 'astro'
import { getPublishedPosts, getTagPages, getTrustPages, trustPageUrl, toPostSummary } from '../lib/content'
import { SITE_URL } from '../lib/site'
import type { Lang } from '../lib/markdown'

// Date the trust pages (about/contact/privacy) and /speaking/ were last edited.
const TRUST_PAGES_LASTMOD = new Date('2026-08-22')

interface SitemapEntry {
  url: string
  lastmod: Date
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts()
  const pages = await getTrustPages()
  const langs: Lang[] = ['en', 'pt-br']

  const newestPostDate = (lang?: Lang) => {
    const candidates = lang ? posts.filter((post) => post.data.lang === lang) : posts
    return candidates.reduce(
      (latest, post) => (post.data.date > latest ? post.data.date : latest),
      new Date(0),
    )
  }

  const entries: SitemapEntry[] = []

  for (const lang of langs) {
    const prefix = lang === 'en' ? '' : '/pt-br'
    entries.push({ url: `${prefix}/`, lastmod: newestPostDate(lang) })
    entries.push({ url: `${prefix}/blog/`, lastmod: newestPostDate(lang) })
    entries.push({ url: `${prefix}/speaking/`, lastmod: TRUST_PAGES_LASTMOD })
    for (const tagPage of getTagPages(posts, lang)) {
      const lastmod = tagPage.posts.reduce(
        (latest, post) => (post.data.date > latest ? post.data.date : latest),
        new Date(0),
      )
      entries.push({ url: tagPage.url, lastmod })
    }
  }

  for (const post of posts) {
    entries.push({ url: toPostSummary(post).url, lastmod: post.data.date })
  }

  for (const page of pages) {
    entries.push({ url: trustPageUrl(page), lastmod: TRUST_PAGES_LASTMOD })
  }

  const urlset = entries
    .map((entry) => {
      const loc = escapeXml(new URL(entry.url, SITE_URL).href)
      const lastmod = entry.lastmod.toISOString().slice(0, 10)
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
