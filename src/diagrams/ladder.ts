import { eyebrow, lines, node, path, type Diagram } from './svg'

// Layer stack, cheapest rung on top. Focal: a broken connector skips the
// browser and desktop rungs and goes straight to asking you.
const t = {
  en: {
    axis: '↓ slower, costlier, riskier',
    rungs: [
      ['What it knows', 'context · memory'],
      ['App API', 'connector or MCP'],
      ['Web search'],
      ['Logged-in browser'],
      ['Full desktop'],
      ['Ask you'],
    ],
    broken: ['connector', 'broken?'],
  },
  'pt-br': {
    axis: '↓ mais lento, caro e arriscado',
    rungs: [
      ['O que ele já sabe', 'contexto · memória'],
      ['API do app', 'conector ou MCP'],
      ['Busca na web'],
      ['Navegador logado'],
      ['Desktop inteiro'],
      ['Perguntar a você'],
    ],
    broken: ['conector', 'quebrado?'],
  },
}

export const ladder: Diagram = {
  title: {
    en: 'Cheapest-first ladder',
    'pt-br': 'Escada do mais barato ao mais caro',
  },
  desc: {
    en: 'Six rungs from cheapest to costliest (what the agent already knows, an app API, web search, its logged-in browser, the full desktop, and asking you), where a broken connector goes straight to asking you.',
    'pt-br':
      'Seis degraus do mais barato ao mais caro (o que o agente já sabe, a API do app, busca na web, o navegador logado, o desktop inteiro e perguntar a você), em que um conector quebrado leva direto a perguntar a você.',
  },
  caption: {
    en: 'Each rung is slower, costlier and riskier than the one above. A broken connector means warning you and asking, never a detour through the browser.',
    'pt-br':
      'Cada degrau é mais lento, mais caro e mais arriscado que o de cima. Conector quebrado significa avisar e perguntar, nunca contornar pelo navegador.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    const y = (i: number) => 40 + i * 56
    return {
      height: 384,
      body: [
        eyebrow(16, 24, l.axis),
        path(id, `M232,120 H248 Q256,120 256,128 V336 Q256,344 248,344 H232`, 'accent'),
        `<rect x="264" y="184" width="80" height="40" rx="2" class="dg-mask"/>`,
        lines(304, 200, l.broken, 72, 'dg-label dg-label-accent'),
        ...l.rungs.map(([name, sub], i) =>
          node({ x: 16, y: y(i), w: 216, h: 48, name, sub, left: 36, kind: i === 5 ? 'focal' : 'node' }),
        ),
        ...l.rungs.map((_, i) => lines(28, y(i) + 28, [String(i + 1)], 16)),
      ],
    }
  },
}
