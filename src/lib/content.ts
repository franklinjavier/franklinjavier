// Shared content-collection queries for machine-readable endpoints
// (markdown variants, llms.txt, sitemap.xml).

import { getCollection, type CollectionEntry } from 'astro:content'
import { parseTags, getPostUrl, getTagUrl } from '../i18n/utils'
import type { Lang, PostSummary } from './markdown'

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
