import { eyebrow, label, lines, name, node, path, type Diagram } from './svg'

// Fan-in queue: five kinds of trigger converge on the router, which drops
// duplicates and picks the conversation; everything joins the back of that
// conversation's queue except your 1:1 message, which cuts in (focal).
const t = {
  en: {
    sources: ['You, in any app', 'Slack, calls, meetings', 'Routine or webhook', 'Another agent', 'Finished work, check-ins'],
    router: 'Router',
    routerSub: ['drops', 'duplicates,', 'picks the', 'conversation'],
    back: 'TO THE BACK',
    cuts: 'CUTS IN',
    slots: [
      ['helper', 'done'],
      ['routine', '8:00'],
      ['batch', '×3 msgs'],
      ['you', '1:1'],
    ],
    queue: 'QUEUE · ONE TURN AT A TIME',
    turn: 'One turn',
  },
  'pt-br': {
    sources: ['Você, em qualquer app', 'Slack, ligação, reunião', 'Rotina ou webhook', 'Outro agente', 'Trabalho feito, check-in'],
    router: 'Roteador',
    routerSub: ['descarta', 'duplicatas,', 'escolhe a', 'conversa'],
    back: 'VAI PRO FIM',
    cuts: 'FURA A FILA',
    slots: [
      ['helper', 'pronto'],
      ['rotina', '8:00'],
      ['lote', '×3 msgs'],
      ['você', '1:1'],
    ],
    queue: 'FILA · UM TURNO POR VEZ',
    turn: 'Um turno',
  },
}

export const wakeups: Diagram = {
  title: {
    en: 'Wake-ups: router and conversation queue',
    'pt-br': 'Gatilhos: roteador e fila da conversa',
  },
  desc: {
    en: "Messages from you, Slack and calls, routines and webhooks, other agents, and finished work or check-ins go through a router that drops duplicates and picks the conversation, then wait in that conversation's queue for one turn at a time, except your 1:1 message, which cuts to the front.",
    'pt-br':
      'Mensagens suas, do Slack e de ligações, rotinas e webhooks, outros agentes e trabalho pronto ou check-ins passam por um roteador que descarta duplicatas e escolhe a conversa, depois esperam na fila dessa conversa, um turno por vez, exceto sua mensagem no chat individual, que fura a fila.',
  },
  caption: {
    en: "Every trigger passes through the router into its conversation's queue. Quick messages wait as one batch; your 1:1 message goes to the front.",
    'pt-br':
      'Todo gatilho passa pelo roteador e entra na fila da sua conversa. Mensagens rápidas esperam como um lote; sua mensagem no chat individual vai para a frente.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    const rows = [32, 72, 112, 152, 192]
    const slotX = [32, 108, 184, 260]
    return {
      height: 452,
      body: [
        `<rect x="16" y="264" width="320" height="96" rx="8" class="dg-zone dg-zone-fill"/>`,
        eyebrow(32, 344, l.queue),
        ...rows.map((y) => path(id, `M192,${y} H232`)),
        path(id, 'M248,208 V232 Q248,240 240,240 H72 Q64,240 64,248 V276'),
        path(id, 'M292,208 V276', 'accent'),
        path(id, 'M292,320 V388'),
        label(l.back, 'above', { x: 148, y: 240 }),
        label(l.cuts, 'left', { x: 292, y: 256 }, true),
        ...l.sources.map((source, i) =>
          node({ x: 16, y: rows[i] - 16, w: 176, h: 32, name: source, kind: 'input', small: true }),
        ),
        node({ x: 232, y: 16, w: 104, h: 192 }),
        name(284, 84, l.router, 96),
        lines(284, 108, l.routerSub, 96),
        ...l.slots.map(([a, b], i) =>
          node({ x: slotX[i], y: 276, w: 64, h: 44, kind: i === 3 ? 'focal' : 'node' }) +
          lines(slotX[i] + 32, 294, [a, b], 56, i === 3 ? 'dg-sub dg-sub-accent' : 'dg-sub'),
        ),
        node({ x: 248, y: 388, w: 88, h: 48, rx: 20, name: l.turn }),
      ],
    }
  },
}
