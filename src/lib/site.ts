export const SITE_URL = 'https://franklinjavier.com'
export const SITE_TITLE = 'Franklin Javier'
export const SITE_DESCRIPTION =
  "I'm a Principal Engineer with 16 years of front-end development experience, delivering high-performance web and mobile applications."
export const SITE_AUTHOR = 'Franklin Javier'
export const SITE_EMAIL = 'franklinjalves@gmail.com'
export const SITE_IMAGE = '/img/frank.jpeg'
export const SITE_JOB_TITLE = 'Principal Engineer'
export const SITE_LOCATION = { locality: 'Lisbon', country: 'PT' }
export const SOCIAL_LINKS = [
  'https://www.linkedin.com/in/franklinjavier-98504321',
  'https://github.com/franklinjavier',
]

export function absoluteUrl(path: string, site?: URL | string): string {
  return new URL(path, site ?? SITE_URL).href
}

export function personJsonLd() {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_AUTHOR,
    url: `${SITE_URL}/`,
    image: absoluteUrl(SITE_IMAGE),
    description: SITE_DESCRIPTION,
    jobTitle: SITE_JOB_TITLE,
    email: `mailto:${SITE_EMAIL}`,
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

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_TITLE,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage: ['en', 'pt-BR'],
    author: { '@id': `${SITE_URL}/#person` },
  }
}

export function baseJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [personJsonLd(), websiteJsonLd()],
  }
}

export function blogPostingJsonLd(post: {
  title: string
  description?: string
  date: Date
  url: string
  lang: string
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.description ? { description: post.description } : {}),
    datePublished: post.date.toISOString(),
    inLanguage: post.lang === 'pt-br' ? 'pt-BR' : 'en',
    url: absoluteUrl(post.url),
    mainEntityOfPage: absoluteUrl(post.url),
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
  }
}
