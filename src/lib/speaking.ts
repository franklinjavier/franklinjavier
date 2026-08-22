// Public appearances (podcasts, talks). Single source of truth for the
// /speaking/ page, its markdown twin and its JSON-LD.
//
// Only add an entry once the link resolves and the participation is confirmed.
//
// Pending: publication date of the "Performance em E-commerce" talk.
//
// Ruled out by the author - search results attributed these but they are not
// appearances: Hipsters Ponto Tech #416 "Performance na Web 2", BuildCon 2025
// "Keep it Clean", and the LeadDev Lisbon launch (the last two came from posts
// that were merely interacted with).

import { SITE_URL } from './site'
import type { Lang } from './markdown'

export type AppearanceKind = 'podcast' | 'talk'

export interface Appearance {
  id: string
  kind: AppearanceKind
  /** Series, conference or channel the appearance belongs to. */
  event: string
  url: string
  /** ISO date, when known. */
  date?: string
  title: Record<Lang, string>
  summary: Record<Lang, string>
  /** Other named participants, as credited by the source. */
  with?: string[]
}

export const APPEARANCES: Appearance[] = [
  {
    id: 'hipsters-114',
    kind: 'podcast',
    event: 'Hipsters Ponto Tech #114',
    url: 'https://www.hipsters.tech/performance-e-otimizacoes-na-web-hipsters-114/',
    date: '2018-09-18',
    title: {
      en: 'Performance e Otimizações na Web',
      'pt-br': 'Performance e Otimizações na Web',
    },
    summary: {
      en: 'A round table on web performance: how to measure it, which metrics are worth tracking, what HTTP/2 changed, and the practices behind a fast e-commerce front end. Recorded while I was Head of Front-end at Beleza na Web.',
      'pt-br':
        'Mesa redonda sobre performance web: como medir, quais métricas acompanhar, o que o HTTP/2 mudou e as práticas por trás de um front-end de e-commerce rápido. Gravado enquanto eu era Head de Front-end na Beleza na Web.',
    },
    with: ['Paulo Silveira', 'William Bruno', 'Sérgio Lopes'],
  },
  {
    id: 'performance-em-ecommerce',
    kind: 'talk',
    event: 'YouTube',
    url: 'https://www.youtube.com/watch?v=ad7e9TuQs1s',
    title: {
      en: 'Performance em E-commerce',
      'pt-br': 'Performance em E-commerce',
    },
    summary: {
      en: 'A talk with Wanderlei Souza on front-end performance in e-commerce, from the Beleza na Web years.',
      'pt-br':
        'Palestra com Wanderlei Souza sobre performance de front-end em e-commerce, da época da Beleza na Web.',
    },
    with: ['Wanderlei Souza'],
  },
]

export function speakingUrl(lang: Lang): string {
  return lang === 'en' ? '/speaking/' : '/pt-br/speaking/'
}

export function speakingJsonLd(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? 'Talks and podcast appearances' : 'Palestras e participações em podcasts',
    url: new URL(speakingUrl(lang), SITE_URL).href,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: APPEARANCES.length,
    itemListElement: APPEARANCES.map((appearance, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': appearance.kind === 'podcast' ? 'PodcastEpisode' : 'CreativeWork',
        name: appearance.title[lang],
        description: appearance.summary[lang],
        url: appearance.url,
        inLanguage: 'pt-BR',
        ...(appearance.date ? { datePublished: appearance.date } : {}),
        ...(appearance.kind === 'podcast'
          ? { partOfSeries: { '@type': 'PodcastSeries', name: 'Hipsters Ponto Tech' } }
          : {}),
        contributor: { '@id': `${SITE_URL}/#person` },
      },
    })),
  }
}
