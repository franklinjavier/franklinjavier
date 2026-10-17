// map: Shared language-filtered RSS builder using published post URLs.
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getPublishedPosts, toPostSummary } from './content'
import { SITE_TITLE, SITE_URL } from './site'
import { ui } from '../i18n/ui'
import type { Lang } from './markdown'

export async function buildFeed(context: APIContext, lang: Lang) {
  const posts = await getPublishedPosts(lang)
  return rss({
    title: SITE_TITLE,
    description: ui[lang]['home.description'],
    site: context.site || SITE_URL,
    customData: `<language>${lang === 'pt-br' ? 'pt-BR' : 'en'}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: toPostSummary(post).url,
    })),
  })
}
