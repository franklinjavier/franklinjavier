// map: Allowed post tags per language, retired-tag aliases and their redirect resolver.
import type { Lang } from './markdown'

/** Every tag a post may use, per language. tests/tags.test.ts fails on anything else. */
export const TAGS: Record<Lang, readonly string[]> = {
  en: [
    'ai',
    'agents',
    'architecture',
    'css',
    'frontend',
    'open-source',
    'performance',
    'personal',
    'productivity',
    'react',
    'security',
    'testing',
    'tooling',
  ],
  'pt-br': [
    'ia',
    'agentes',
    'arquitetura',
    'css',
    'frontend',
    'open-source',
    'performance',
    'pessoal',
    'produtividade',
    'react',
    'segurança',
    'testes',
    'tooling',
  ],
}

/**
 * Retired tags and the tag that replaced them, per language. Their tag pages were
 * indexed, so the Worker answers them with a permanent redirect to the new page.
 */
export const TAG_ALIASES: Record<Lang, Record<string, string>> = {
  en: {
    'core-web-vitals': 'performance',
    'critical-thinking': 'ai',
    'e-commerce': 'performance',
    'front-end': 'frontend',
    'personal-development': 'productivity',
    'personal-life': 'personal',
    'self-hosting': 'tooling',
    conference: 'ai',
    evals: 'ai',
    family: 'personal',
    git: 'tooling',
    interview: 'architecture',
    javascript: 'frontend',
    learning: 'productivity',
    lifehack: 'productivity',
    linux: 'tooling',
    llm: 'ai',
    openai: 'ai',
    optimization: 'performance',
    os: 'tooling',
    osx: 'tooling',
    stylex: 'css',
    tailwind: 'css',
    tip: 'tooling',
    windows: 'tooling',
  },
  'pt-br': {
    'core-web-vitals': 'performance',
    'desenvolvimento-pessoal': 'produtividade',
    'e-commerce': 'performance',
    'front-end': 'frontend',
    'pensamento-critico': 'ia',
    'self-hosting': 'tooling',
    'vida-pessoal': 'pessoal',
    conferência: 'ia',
    entrevista: 'arquitetura',
    estudos: 'produtividade',
    evals: 'ia',
    familia: 'pessoal',
    git: 'tooling',
    javascript: 'frontend',
    lifehack: 'produtividade',
    linux: 'tooling',
    llm: 'ia',
    openai: 'ia',
    optimization: 'performance',
    os: 'tooling',
    osx: 'tooling',
    stylex: 'css',
    tailwind: 'css',
    tip: 'tooling',
    windows: 'tooling',
  },
}

/** Redirect target for a retired tag page (EN or PT-BR, with or without trailing slash). */
export function tagRedirect(path: string): string | null {
  const match = /^(\/pt-br)?\/blog\/tag\/([^/]+)\/?$/.exec(path)
  if (!match) return null
  let tag: string
  try {
    tag = decodeURIComponent(match[2]!)
  } catch {
    return null
  }
  const aliases = TAG_ALIASES[match[1] ? 'pt-br' : 'en']
  return Object.hasOwn(aliases, tag) ? `${match[1] ?? ''}/blog/tag/${aliases[tag]}/` : null
}
