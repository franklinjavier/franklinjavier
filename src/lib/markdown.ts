// Builders for the markdown variants of every HTML page.
// Kept free of astro:content imports so they stay unit-testable;
// callers pass plain data extracted from content collections.

import { ui } from '../i18n/ui'
import { SITE_TITLE, SITE_DESCRIPTION, SITE_EMAIL, SITE_URL, SOCIAL_LINKS } from './site'
import { APPEARANCES, speakingUrl } from './speaking'

export type Lang = 'en' | 'pt-br'

export interface PostSummary {
  title: string
  description?: string
  date: Date
  url: string
  tags: string[]
  author: string
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function absolute(path: string): string {
  return new URL(path, SITE_URL).href
}

function postList(posts: PostSummary[]): string {
  return posts
    .map((post) => {
      const suffix = post.description ? `: ${post.description}` : ''
      return `- [${post.title}](${absolute(post.url)}) (${formatIsoDate(post.date)})${suffix}`
    })
    .join('\n')
}

function footerNote(lang: Lang): string {
  return lang === 'en'
    ? `---\n\nEvery page on this site is also available as markdown: request any URL with the \`Accept: text/markdown\` header. See [llms.txt](${absolute('/llms.txt')}) and the [sitemap](${absolute('/sitemap.xml')}).`
    : `---\n\nTodas as páginas deste site também estão disponíveis em markdown: solicite qualquer URL com o header \`Accept: text/markdown\`. Veja o [llms.txt](${absolute('/llms.txt')}) e o [sitemap](${absolute('/sitemap.xml')}).`
}

export function homeMarkdown(lang: Lang, posts: PostSummary[]): string {
  const t = ui[lang]
  const prefix = lang === 'en' ? '' : '/pt-br'
  const recent = posts.slice(0, 6)

  return `# ${SITE_TITLE} — ${t['experience.role1']}

> ${t['hero.bio1']}

${t['hero.bio2']}

${t['hero.bio3']}

## ${t['experience.title']}

- ${t['experience.role1']} — ${t['experience.company1']} (${t['experience.period1']})
- ${t['experience.role2']} — ${t['experience.company2']} (${t['experience.period2']})
- ${t['experience.role3']} — ${t['experience.company3']} (${t['experience.period3']})

## ${t['stack.title']}

React / TypeScript, Remix / Node.js, Tailwind CSS, Performance Optimization, Design Systems, Accessibility (a11y)

## ${t['contact.title']}

- ${t['contact.location']}
- Email: ${SITE_EMAIL}
- ${SOCIAL_LINKS.map((link) => `<${link}>`).join('\n- ')}
- CV: ${absolute('/cv.pdf')}

## ${t['blog.recentPosts']}

${postList(recent)}

[${t['nav.blog']}](${absolute(`${prefix}/blog/`)}) · [${t['nav.speaking']}](${absolute(`${prefix}/speaking/`)}) · [${t['nav.about']}](${absolute(`${prefix}/about/`)}) · [${t['nav.contact']}](${absolute(`${prefix}/contact/`)}) · [${t['nav.privacy']}](${absolute(`${prefix}/privacy/`)})

${footerNote(lang)}
`
}

export function blogIndexMarkdown(lang: Lang, posts: PostSummary[]): string {
  const t = ui[lang]

  return `# ${t['blog.title']} — ${SITE_TITLE}

> ${t['blog.description']}

${postList(posts)}

${footerNote(lang)}
`
}

export function tagIndexMarkdown(lang: Lang, tag: string, posts: PostSummary[]): string {
  const t = ui[lang]

  return `# ${t['blog.postsTagged']} "${tag}" — ${SITE_TITLE}

${postList(posts)}

${footerNote(lang)}
`
}

export function postMarkdown(post: PostSummary & { lang: Lang; body: string }): string {
  const lines = [
    `# ${post.title}`,
    '',
    ...(post.description ? [`> ${post.description}`, ''] : []),
    `- Author: ${post.author}`,
    `- Published: ${formatIsoDate(post.date)}`,
    `- Language: ${post.lang === 'en' ? 'English' : 'Português (Brasil)'}`,
    ...(post.tags.length > 0 ? [`- Tags: ${post.tags.join(', ')}`] : []),
    `- Canonical: ${absolute(post.url)}`,
    '',
    post.body.trim(),
    '',
    footerNote(post.lang),
    '',
  ]
  return lines.join('\n')
}

export function speakingMarkdown(lang: Lang): string {
  const t = ui[lang]
  const entries = [...APPEARANCES]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .map((appearance) => {
      const kind =
        appearance.kind === 'podcast' ? t['speaking.kind.podcast'] : t['speaking.kind.talk']
      const meta = [kind, appearance.event, appearance.date].filter(Boolean).join(' · ')
      const credits =
        appearance.with && appearance.with.length > 0
          ? `\n  ${t['speaking.with']}: ${appearance.with.join(', ')}`
          : ''
      return `- [${appearance.title[lang]}](${appearance.url}) (${meta})\n  ${appearance.summary[lang]}${credits}`
    })
    .join('\n')

  return `# ${t['speaking.title']} — ${SITE_TITLE}

> ${t['speaking.description']}

- Canonical: ${absolute(speakingUrl(lang))}

${t['speaking.intro']}

${entries}

${footerNote(lang)}
`
}

export function staticPageMarkdown(page: {
  title: string
  description?: string
  lang: Lang
  url: string
  body: string
}): string {
  const lines = [
    `# ${page.title} — ${SITE_TITLE}`,
    '',
    ...(page.description ? [`> ${page.description}`, ''] : []),
    `- Canonical: ${absolute(page.url)}`,
    '',
    page.body.trim(),
    '',
    footerNote(page.lang),
    '',
  ]
  return lines.join('\n')
}

export function siteDescriptionFor(lang: Lang): string {
  return lang === 'en' ? SITE_DESCRIPTION : ui['pt-br']['hero.bio1']
}
