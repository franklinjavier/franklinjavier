import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import {
  getPublishedPosts,
  getTagPages,
  getTrustPages,
  toPostSummary,
  trustPageUrl,
} from '../../lib/content'
import {
  homeMarkdown,
  blogIndexMarkdown,
  tagIndexMarkdown,
  postMarkdown,
  staticPageMarkdown,
  type Lang,
} from '../../lib/markdown'

// Pre-renders a markdown twin of every HTML page as <page-url>/index.md.
// The Vercel Edge Middleware (see /middleware.ts) rewrites requests that
// send `Accept: text/markdown` to these files.

type Props =
  | { kind: 'home'; lang: Lang }
  | { kind: 'blogIndex'; lang: Lang }
  | { kind: 'tag'; lang: Lang; tag: string }
  | { kind: 'post'; post: CollectionEntry<'blog'> }
  | { kind: 'page'; page: CollectionEntry<'pages'> }

function pathParam(url: string): string | undefined {
  const trimmed = url.replace(/^\/|\/$/g, '')
  return trimmed === '' ? undefined : trimmed
}

export async function getStaticPaths() {
  const posts = await getPublishedPosts()
  const pages = await getTrustPages()
  const langs: Lang[] = ['en', 'pt-br']

  const paths: { params: { path: string | undefined }; props: Props }[] = []

  for (const lang of langs) {
    const prefix = lang === 'en' ? '' : 'pt-br'
    paths.push({ params: { path: pathParam(prefix) }, props: { kind: 'home', lang } })
    paths.push({
      params: { path: prefix ? `${prefix}/blog` : 'blog' },
      props: { kind: 'blogIndex', lang },
    })
    for (const tagPage of getTagPages(posts, lang)) {
      paths.push({
        params: { path: pathParam(tagPage.url) },
        props: { kind: 'tag', lang, tag: tagPage.tag },
      })
    }
  }

  for (const post of posts) {
    paths.push({
      params: { path: pathParam(toPostSummary(post).url) },
      props: { kind: 'post', post },
    })
  }

  for (const page of pages) {
    paths.push({ params: { path: pathParam(trustPageUrl(page)) }, props: { kind: 'page', page } })
  }

  return paths
}

async function buildMarkdown(props: Props): Promise<string> {
  switch (props.kind) {
    case 'home': {
      const posts = await getPublishedPosts(props.lang)
      return homeMarkdown(props.lang, posts.map(toPostSummary))
    }
    case 'blogIndex': {
      const posts = await getPublishedPosts(props.lang)
      return blogIndexMarkdown(props.lang, posts.map(toPostSummary))
    }
    case 'tag': {
      const posts = await getPublishedPosts(props.lang)
      const tagPage = getTagPages(posts, props.lang).find((page) => page.tag === props.tag)
      return tagIndexMarkdown(props.lang, props.tag, (tagPage?.posts ?? []).map(toPostSummary))
    }
    case 'post': {
      return postMarkdown({
        ...toPostSummary(props.post),
        lang: props.post.data.lang,
        body: props.post.body,
      })
    }
    case 'page': {
      return staticPageMarkdown({
        title: props.page.data.title,
        description: props.page.data.description,
        lang: props.page.data.lang,
        url: trustPageUrl(props.page),
        body: props.page.body,
      })
    }
  }
}

export const GET: APIRoute = async ({ props }) => {
  const body = await buildMarkdown(props as Props)
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
    },
  })
}
