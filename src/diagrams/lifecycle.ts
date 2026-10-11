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
    sleeps: ['VM não acorda', 'nenhuma tool pediu'],
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
      'Uma mensagem ou uma rotina inicia um turno que salva cada passo; a VM só acorda se uma tool precisar dela e, depois, nada roda: o processo para após 2 minutos ocioso e a VM dorme como snapshot.',
  },
  caption: {
    en: 'Between events nothing runs. A turn wakes the VM only when a tool needs it, so a routine that never touches the computer leaves it asleep.',
    'pt-br':
      'Entre um evento e outro, nada roda. Um turno só acorda a VM quando uma tool precisa dela; uma rotina que não usa o computador deixa a VM dormindo.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    return {
      height: 480,
      body: [
        path(id, 'M92,64 V76 Q92,84 100,84 H152 Q160,84 160,92 V104'),
        path(id, 'M260,64 V76 Q260,84 252,84 H200 Q192,84 192,92 V104'),
        path(id, 'M176,160 V184'),
        path(id, 'M120,244 V304'),
        path(id, 'M232,244 V304'),
        path(id, 'M92,360 V372 Q92,380 100,380 H152 Q160,380 160,388 V408'),
        path(id, 'M260,360 V372 Q260,380 252,380 H200 Q192,380 192,388 V408'),
        label(l.yes, 'left', { x: 120, y: 284 }),
        label(l.no, 'right', { x: 232, y: 284 }),
        node({ x: 16, y: 16, w: 152, h: 48, rx: 20, name: l.message, kind: 'input' }),
        node({ x: 184, y: 16, w: 152, h: 48, rx: 20, name: l.routine, kind: 'input' }),
        node({ x: 64, y: 104, w: 224, h: 56, ...ns(l.turn) }),
        diamond(176, 224, 112, 40, l.question, 'focal'),
        node({ x: 16, y: 304, w: 152, h: 56, ...ns(l.wakes) }),
        node({ x: 184, y: 304, w: 152, h: 56, ...ns(l.sleeps) }),
        node({ x: 16, y: 408, w: 320, h: 56, rx: 20, ...ns(l.idle), kind: 'store' }),
      ],
    }
  },
}
