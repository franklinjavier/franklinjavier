import { diamond, label, node, ns, path, type Diagram } from './svg'

// Flowchart: two triggers start a turn, the VM wakes only when a tool needs
// it, and afterwards nothing runs. Focal: the "needs the VM?" decision.
const t = {
  en: {
    message: 'Your message',
    routine: '8:00 routine',
    turn: ['Turn runs', 'saves each step'],
    question: 'Needs the VM?',
    yes: 'YES',
    no: 'NO',
    wakes: ['VM wakes up', 'snapshot restored'],
    sleeps: ['VM stays asleep', 'no tool needed it'],
    idle: ['Nothing runs', 'process: 2 idle min · VM: snapshot'],
  },
  'pt-br': {
    message: 'Sua mensagem',
    routine: 'Rotina 8:00',
    turn: ['Turno roda', 'salva cada passo'],
    question: 'Precisa da VM?',
    yes: 'SIM',
    no: 'NÃO',
    wakes: ['VM acorda', 'volta do snapshot'],
    sleeps: ['VM não acorda', 'nenhuma ferramenta pediu'],
    idle: ['Nada roda', 'processo: 2 min ocioso · VM: snapshot'],
  },
}

export const lifecycle: Diagram = {
  title: {
    en: 'What stays on between events',
    'pt-br': 'O que fica ligado entre eventos',
  },
  desc: {
    en: 'A message or a routine starts a turn that saves each step; the VM wakes up only if a tool needs it, and afterwards nothing runs: the process stops after 2 idle minutes and the VM sleeps as a snapshot.',
    'pt-br':
      'Uma mensagem ou uma rotina inicia um turno que salva cada passo; a VM só acorda se uma ferramenta precisar dela e, depois, nada roda: o processo para após 2 minutos ocioso e a VM dorme como snapshot.',
  },
  caption: {
    en: 'Between events nothing runs. A turn wakes the VM only when a tool needs it, so a routine that never touches the computer leaves it asleep.',
    'pt-br':
      'Entre um evento e outro, nada roda. Um turno só acorda a VM quando uma ferramenta precisa dela; uma rotina que não usa o computador deixa a VM dormindo.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    return {
      height: 440,
      body: [
        path(id, 'M88,56 V68 Q88,76 96,76 H152 Q160,76 160,84 V96'),
        path(id, 'M264,56 V68 Q264,76 256,76 H200 Q192,76 192,84 V96'),
        path(id, 'M176,144 V168'),
        // the diamond's lower edges are at y=228 above x=120 and x=232
        path(id, 'M120,228 V288'),
        path(id, 'M232,228 V288'),
        path(id, 'M76,336 V348 Q76,356 84,356 H152 Q160,356 160,364 V376'),
        path(id, 'M252,336 V348 Q252,356 244,356 H200 Q192,356 192,364 V376'),
        label(l.yes, 'left', { x: 120, y: 264 }),
        label(l.no, 'right', { x: 232, y: 264 }),
        node({ x: 8, y: 16, w: 160, h: 40, rx: 20, name: l.message, kind: 'input' }),
        node({ x: 184, y: 16, w: 160, h: 40, rx: 20, name: l.routine, kind: 'input' }),
        node({ x: 64, y: 96, w: 224, h: 48, ...ns(l.turn) }),
        diamond(176, 208, 112, 40, l.question, 'focal'),
        // the "asleep" box is wider: its PT reason is the longest sublabel
        node({ x: 8, y: 288, w: 136, h: 48, ...ns(l.wakes) }),
        node({ x: 160, y: 288, w: 184, h: 48, ...ns(l.sleeps) }),
        node({ x: 8, y: 376, w: 336, h: 48, rx: 20, ...ns(l.idle), kind: 'store' }),
      ],
    }
  },
}
