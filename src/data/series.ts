// Post series: the ordered list of published parts, per language, plus a short
// glossary of the terms the parts share. Posts link here through their
// `series: { key, part }` frontmatter; the build and tests/dist.test.ts fail
// when this list and the content collection disagree.

import type { Lang } from '../lib/markdown'

export interface SeriesPartPost {
  title: string
  url: string
  /** One-line takeaway of the part. */
  takeaway: string
}

export interface SeriesPart {
  part: number
  translationKey: string
  posts: Record<Lang, SeriesPartPost>
}

export interface GlossaryEntry {
  term: Record<Lang, string>
  definition: Record<Lang, string>
}

export interface Series {
  name: Record<Lang, string>
  /** Published parts in reading order; the "of M" count in markers comes from here. */
  parts: SeriesPart[]
  glossary: GlossaryEntry[]
}

export const SERIES: Record<string, Series> = {
  'agent-experiments': {
    name: { 'pt-br': 'experimentos com agentes', en: 'experiments with agents' },
    parts: [
      {
        part: 1,
        translationKey: 'old-macbook-context-server',
        posts: {
          'pt-br': {
            title: 'MacBook velho virou servidor de contexto',
            url: '/pt-br/blog/macbook-velho-virou-servidor-de-contexto/',
            takeaway:
              'Um MacBook antigo, de tampa fechada na tomada, guarda o contexto das sessões dos meus agentes num lugar só.',
          },
          en: {
            title: 'My old MacBook is now a context server',
            url: '/blog/old-macbook-context-server/',
            takeaway:
              "An old MacBook, lid closed and plugged in, keeps my agents' session context in one place.",
          },
        },
      },
      {
        part: 2,
        translationKey: 'always-on-agents',
        posts: {
          'pt-br': {
            title: 'Como funciona um agente em loop',
            url: '/pt-br/blog/como-funciona-um-agente-sempre-ligado/',
            takeaway:
              'O que um agente precisa para continuar trabalhando sozinho no servidor, segundo a aula de Lee Robinson, e por onde eu começaria.',
          },
          en: {
            title: 'How an agent loop works',
            url: '/blog/how-always-on-agents-work/',
            takeaway:
              "What an agent needs to keep working on its own on a server, from Lee Robinson's lecture, and where I'd start.",
          },
        },
      },
    ],
    glossary: [
      {
        term: { 'pt-br': 'servidor de contexto', en: 'context server' },
        definition: {
          'pt-br': 'O MacBook velho que guarda o histórico das sessões dos agentes.',
          en: "The old MacBook that stores the agents' session history.",
        },
      },
      {
        term: { 'pt-br': 'memória compartilhada', en: 'shared memory' },
        definition: {
          'pt-br': 'Onde todos os agentes leem e escrevem os resumos das sessões.',
          en: 'Where every agent reads and writes session summaries.',
        },
      },
      {
        term: { 'pt-br': 'agente em loop', en: 'agent loop' },
        definition: {
          'pt-br':
            'Um agente que continua agindo por conta própria, acordado por eventos, sem eu estar no teclado.',
          en: 'An agent that keeps taking turns on its own, woken by events, without me at the keyboard.',
        },
      },
      {
        term: { 'pt-br': 'oficina de agentes', en: 'agent workshop' },
        definition: {
          'pt-br': 'O próximo experimento: vários agentes rodando em loop juntos (planejado).',
          en: 'The next experiment: several agents running in loops together (planned).',
        },
      },
    ],
  },
}
