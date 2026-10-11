import { eyebrow, lines, node, ns, type Diagram } from './svg'

// Layer stack in prompt order. Everything above the newest message repeats on
// the next call and can be served from cache; the newest message (focal) is
// the only new part. Every reused section carries its own hash.
const t = {
  en: {
    stable: 'STABLE UNTIL THE NEXT SUMMARY',
    sections: [
      ['Tool definitions', 'same set every turn'],
      ['System prompt', 'memory + routines snapshot'],
      ['First message', 'environment + tool names'],
    ],
    history: 'HISTORY · ONLY GROWS AT THE END',
    turns: ['Earlier turns', 'joins the prefix next call'],
    fresh: 'NEW IN EVERY CALL',
    newest: ['Newest message', 'time · change notes · user message'],
  },
  'pt-br': {
    stable: 'IGUAL ATÉ O PRÓXIMO RESUMO',
    sections: [
      ['Definições de ferramentas', 'mesmo conjunto todo turno'],
      ['Prompt de sistema', 'snapshot de memória e rotinas'],
      ['Primeira mensagem', 'ambiente + nomes das ferramentas'],
    ],
    history: 'HISTÓRICO · SÓ CRESCE NO FINAL',
    turns: ['Turnos anteriores', 'entra no prefixo da próxima'],
    fresh: 'NOVO A CADA CHAMADA',
    newest: ['Mensagem mais nova', 'hora · notas de mudança · mensagem'],
  },
}

// A small "hash" chip at the right edge of a 48px section starting at y.
function hash(y: number): string {
  return (
    `<rect x="276" y="${y + 12}" width="48" height="24" rx="2" class="dg-chip"/>` +
    lines(300, y + 28, ['hash'], 40)
  )
}

export const promptCache: Diagram = {
  title: {
    en: 'Prompt order for caching',
    'pt-br': 'Ordem do prompt para o cache',
  },
  desc: {
    en: 'The prompt is assembled in a fixed order: tool definitions, system prompt and first message stay the same until the next summary, history only grows at the end, and only the newest message is new on each call.',
    'pt-br':
      'O prompt é montado numa ordem fixa: definições de ferramentas, prompt de sistema e primeira mensagem ficam iguais até o próximo resumo, o histórico só cresce no final e só a mensagem mais nova é nova a cada chamada.',
  },
  caption: {
    en: 'Only the newest message changes between calls, so everything above it can come from the cache. Each section has its own hash to show what changed.',
    'pt-br':
      'Só a mensagem mais nova muda entre chamadas, então tudo acima dela pode vir do cache. Cada seção tem um hash próprio para mostrar o que mudou.',
  },
  lecture: true,
  draw(lang) {
    const l = t[lang]
    // Text in a hashed section stops short of the chip at x=276.
    const section = (y: number, pair: string[]) =>
      node({ x: 16, y, w: 320, h: 48, ...ns(pair), left: 16, rx: 0, right: 64 }) + hash(y)
    return {
      height: 372,
      body: [
        eyebrow(16, 24, l.stable),
        ...l.sections.map((pair, i) => section(36 + i * 48, pair)),
        eyebrow(16, 208, l.history),
        section(220, l.turns),
        eyebrow(16, 296, l.fresh),
        node({ x: 16, y: 308, w: 320, h: 48, ...ns(l.newest), left: 16, rx: 0, kind: 'focal' }),
      ],
    }
  },
}
