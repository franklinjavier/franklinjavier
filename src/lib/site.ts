import { ui } from '../i18n/ui'
import type { Lang } from './markdown'

// Production origin. A build can override it with the SITE_URL build variable
// (the blog-preview Worker sets it to https://blog-preview.imfrank.dev) so
// canonical, og:url, hreflang, sitemap and JSON-LD self-reference the preview
// host instead of duplicating production. The typeof guard keeps the Worker
// bundle (no nodejs_compat, no `process`) on the production origin.
export const SITE_URL =
  (typeof process !== 'undefined' && process.env.SITE_URL) || 'https://franklinjavier.com'
export const SITE_TITLE = 'Franklin Javier'
export const SITE_DESCRIPTION = ui.en['home.description']
export const SITE_AUTHOR = 'Franklin Javier'
export const SITE_EMAIL = 'franklinjalves@gmail.com'
export const SITE_IMAGE = '/img/frank.jpeg'
export const SITE_SOCIAL_IMAGE = '/img/frank-social.webp'
export const SITE_JOB_TITLE = 'Principal Engineer'
export const SITE_LOCATION = { locality: 'Lisbon', country: 'PT' }
export const SITE_X_HANDLE = '@franklinjavier'
export const SOCIAL_LINKS = [
  'https://www.linkedin.com/in/franklin-javier-98504321',
  'https://github.com/franklinjavier',
  'https://x.com/franklinjavier',
  'https://dev.to/franklinjavier',
]

// Employment history, mirrored from the homepage translations. Feeds the
// Person graph so search engines and LLMs disambiguate this Franklin Javier
// from the several unrelated people sharing the name.
export const CURRENT_EMPLOYER = 'Stone Giant Studio'
export const PAST_EMPLOYERS = ['Grupo Boticário', 'Beleza na Web']
export const KNOWS_ABOUT = [
  'Front-end development',
  'Web performance',
  'Core Web Vitals',
  'React',
  'TypeScript',
  'Node.js',
  'Remix',
  'Design systems',
  'Web accessibility',
  'Agentic development',
  'AI agent orchestration',
  'AI coding agents',
  'Agent skills',
  'Engineering leadership',
]

// Side projects, rendered on the homepage and in its markdown twin.
// Descriptions live in the translations under `projects.<key>`. Thumbs are
// each site's og:image (Robot Loupe has none, so it is a homepage screenshot),
// resized to 800x420 webp in public/images/projects/.
export const SIDE_PROJECTS = [
  {
    key: 'wallofai',
    name: 'Wall of AI',
    url: 'https://wallofai.app/?utm_source=FranklinJavier&utm_medium=site',
    image: '/images/projects/wallofai.webp',
  },
  {
    key: 'zelus',
    name: 'Zelus',
    url: 'https://zelus.sh/?utm_source=FranklinJavier&utm_medium=site',
    image: '/images/projects/zelus.webp',
  },
  {
    key: 'campfire',
    name: 'Project Campfire',
    url: 'https://projectcampfire.io/?utm_source=FranklinJavier&utm_medium=site',
    image: '/images/projects/campfire.webp',
  },
  {
    key: 'robotloupe',
    name: 'Robot Loupe',
    url: 'https://robotloupe.com/?utm_source=FranklinJavier&utm_medium=site',
    image: '/images/projects/robotloupe.webp',
  },
] as const

export const OPEN_SOURCE = [
  {
    key: 'xmd',
    name: 'xmd',
    language: 'JavaScript',
    url: 'https://github.com/franklinjavier/xmd?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'uia',
    name: 'uia',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/uia?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'storefront',
    name: 'storefront',
    language: 'JavaScript',
    url: 'https://github.com/franklinjavier/storefront?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'remix-ecommerce',
    name: 'remix-ecommerce',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/remix-ecommerce?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'translate',
    name: 'translate',
    language: 'Swift',
    url: 'https://github.com/franklinjavier/translate?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'shadcn-widget',
    name: 'shadcn-widget',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/shadcn-widget?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'oficina',
    name: 'oficina',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/oficina?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'grokbot-quota-template',
    name: 'grokbot-quota-template',
    language: 'Python',
    url: 'https://github.com/franklinjavier/grokbot-quota-template?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'remix-starter-template',
    name: 'remix-starter-template',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/remix-starter-template?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'retabnews',
    name: 'retabnews',
    language: 'TypeScript',
    url: 'https://github.com/franklinjavier/retabnews?utm_source=FranklinJavier&utm_medium=site',
  },
  {
    key: 'skills',
    name: 'stonegiantstudio/skills',
    language: 'JavaScript',
    url: 'https://github.com/stonegiantstudio/skills?utm_source=FranklinJavier&utm_medium=site',
  },
] as const

// Day-to-day stack, rendered on the homepage and in its markdown twin.
export const DEV_STACK = [
  'React / Typescript',
  'React Router / Remix / Node.js',
  'Tailwind CSS',
  'Performance Optimization',
  'AI Agents / Orchestration',
  'Design Systems',
  'Accessibility (a11y)',
]

export function absoluteUrl(path: string, site?: URL | string): string {
  return new URL(path, site ?? SITE_URL).href
}

export function personJsonLd(lang: Lang = 'en') {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_AUTHOR,
    url: `${SITE_URL}/`,
    image: absoluteUrl(SITE_IMAGE),
    description: ui[lang]['home.description'],
    jobTitle: SITE_JOB_TITLE,
    email: `mailto:${SITE_EMAIL}`,
    worksFor: { '@type': 'Organization', name: CURRENT_EMPLOYER },
    alumniOf: PAST_EMPLOYERS.map((name) => ({ '@type': 'Organization', name })),
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ['en', 'pt-BR'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_LOCATION.locality,
      addressCountry: SITE_LOCATION.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'professional inquiries',
      email: SITE_EMAIL,
      url: `${SITE_URL}/contact/`,
      availableLanguage: ['English', 'Portuguese'],
    },
    sameAs: SOCIAL_LINKS,
  }
}

export function websiteJsonLd(lang: Lang = 'en') {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_TITLE,
    url: `${SITE_URL}/`,
    description: ui[lang]['home.description'],
    inLanguage: ['en', 'pt-BR'],
    author: { '@id': `${SITE_URL}/#person` },
  }
}

/** Person + WebSite graph, described in the page's language. */
export function baseJsonLd(lang: Lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@graph': [personJsonLd(lang), websiteJsonLd(lang)],
  }
}

export function blogPostingJsonLd(post: {
  title: string
  description?: string
  date: Date
  /** Last meaningful edit (`updated` frontmatter); defaults to `date`. */
  updated?: Date
  url: string
  lang: string
  tags?: string[]
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.description ? { description: post.description } : {}),
    datePublished: post.date.toISOString(),
    dateModified: (post.updated ?? post.date).toISOString(),
    inLanguage: post.lang === 'pt-br' ? 'pt-BR' : 'en',
    url: absoluteUrl(post.url),
    mainEntityOfPage: absoluteUrl(post.url),
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    ...(post.image ? { image: absoluteUrl(post.image) } : {}),
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
  }
}
