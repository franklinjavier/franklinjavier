// Shared content-collection queries for machine-readable endpoints
// (markdown variants, llms.txt, sitemap.xml).

import { getCollection, type CollectionEntry } from 'astro:content'
import { parseTags, getPostUrl, getTagUrl } from '../i18n/utils'
import type { Lang, PostSummary } from './markdown'
import { seriesDrift, seriesNav, type SeriesNav, type SeriesRef } from './series'

export async function getPublishedPosts(lang?: Lang): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => {
    return data.draft !== true && (lang === undefined || data.lang === lang)
  })
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export function toPostSummary(post: CollectionEntry<'blog'>): PostSummary {
  return {
    title: post.data.title,
    description: post.data.description,
    date: post.data.date,
    url: getPostUrl(post.id, post.data.lang),
    tags: parseTags(post.data.tags),
    author: post.data.author,
  }
}

// Fails the build when src/data/series.ts and the published posts disagree.
// Called from the blog post routes' getStaticPaths, so stale series data fails
// the build even when no published post carries `series` frontmatter.
// Memoized for the build; dev re-checks so edits show up without a restart.
let seriesCheck: Promise<void> | undefined

export function checkSeriesData(): Promise<void> {
  if (!seriesCheck || !import.meta.env.PROD) seriesCheck = runSeriesCheck()
  return seriesCheck
}

async function runSeriesCheck(): Promise<void> {
  const posts = await getPublishedPosts()
  const problems = seriesDrift(
    posts.map((post) => ({
      lang: post.data.lang,
      title: post.data.title,
      url: getPostUrl(post.id, post.data.lang),
      translationKey: post.data.translationKey,
      series: post.data.series,
    })),
  )
  if (problems.length > 0) {
    throw new Error(`Series data is out of sync:\n- ${problems.join('\n- ')}`)
  }
}

// Series marker and neighbouring parts, or undefined when the post is in no series.
export async function getSeriesNav(
  lang: Lang,
  series: SeriesRef | undefined,
): Promise<SeriesNav | undefined> {
  if (!series) return undefined
  await checkSeriesData()
  return seriesNav(series, lang)
}

export interface TagPage {
  lang: Lang
  tag: string
  url: string
  posts: CollectionEntry<'blog'>[]
}

export function getTagPages(posts: CollectionEntry<'blog'>[], lang: Lang): TagPage[] {
  const byTag = new Map<string, CollectionEntry<'blog'>[]>()
  for (const post of posts.filter((p) => p.data.lang === lang)) {
    for (const tag of parseTags(post.data.tags)) {
      const existing = byTag.get(tag) ?? []
      existing.push(post)
      byTag.set(tag, existing)
    }
  }
  return Array.from(byTag.entries()).map(([tag, tagPosts]) => ({
    lang,
    tag,
    url: getTagUrl(tag, lang),
    posts: tagPosts,
  }))
}

export async function getTrustPages(): Promise<CollectionEntry<'pages'>[]> {
  return getCollection('pages')
}

export function trustPageUrl(page: CollectionEntry<'pages'>): string {
  return `/${page.id}/`
}

// Social preview image for a post: the `image` frontmatter field, or else the
// first image in the body. Only site-relative or https images qualify, so an
// old http:// embed never becomes the preview; callers fall back to the
// site image when this returns undefined.
export function postImage(post: CollectionEntry<'blog'>): string | undefined {
  if (post.data.image) return post.data.image
  const match = /<img\b[^>]*\bsrc="([^"]+)"|!\[[^\]]*\]\(([^)\s]+)/.exec(post.body ?? '')
  const src = match?.[1] ?? match?.[2]
  return src && (src.startsWith('/') || src.startsWith('https://')) ? src : undefined
}
