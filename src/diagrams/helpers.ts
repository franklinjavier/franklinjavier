import { label, node, ns, path, type Diagram } from './svg'

// Tree: you talk to the main agent (focal); it sends full task descriptions
// down to four helpers and gets short reports back up.
const t = {
  en: {
    you: 'You',
    main: ['Main agent', 'orchestrator · answers fast'],
    task: 'FULL TASK',
    report: 'SHORT REPORT',
    helpers: [
      ['General', 'shell · web · connectors'],
      ['Computer use', 'one task at a time'],
      ['Video', 'watches and reviews files'],
      ['Cloud coding agent', 'changes code in its own VM'],
    ],
  },
  'pt-br': {
    you: 'Você',
    main: ['Agente principal', 'orquestrador · responde rápido'],
    task: 'TAREFA COMPLETA',
    report: 'RELATÓRIO CURTO',
    helpers: [
      ['Geral', 'shell · web · conectores'],
      ['Uso de computador', 'uma tarefa por vez'],
      ['Vídeo', 'assiste e revisa arquivos'],
      ['Agente de código na nuvem', 'muda código na própria VM'],
    ],
  },
}

export const helpers: Diagram = {
  title: {
    en: 'Main agent and helpers',
    'pt-br': 'Agente principal e helpers',
  },
  desc: {
    en: 'You talk to the main agent, which sends full task descriptions to general, computer-use and video helpers and to a cloud coding helper that works in its own VM, separate from yours, and gets short reports back.',
    'pt-br':
      'Você conversa com o agente principal, que manda descrições completas de tarefas aos helpers geral, de uso de computador e de vídeo e a um helper de código na nuvem que trabalha numa VM só dele, separada da sua, e recebe relatórios curtos de volta.',
  },
  caption: {
    en: 'The main agent keeps talking to you while helpers work. It can check on a helper, send it a message, or stop it.',
    'pt-br':
      'O agente principal continua falando com você enquanto os helpers trabalham. Ele pode consultar um helper, mandar mensagem a ele ou pará-lo.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    const mids = [216, 276, 336, 396]
    return {
      height: 436,
      body: [
        path(id, 'M160,56 V88'),
        path(id, 'M192,88 V56'),
        // task descriptions down the left trunk, reports up the right one
        path(id, 'M72,136 V388 Q72,396 80,396 H96'),
        ...mids.slice(0, 3).map((y) => path(id, `M72,${y} H96`)),
        path(id, 'M304,396 H312 Q320,396 320,388 V120 Q320,112 312,112 H296'),
        ...mids.slice(0, 3).map((y) => path(id, `M304,${y} H320`, 'muted', false)),
        label(l.task, 'right', { x: 72, y: 152 }),
        label(l.report, 'left', { x: 320, y: 176 }),
        node({ x: 120, y: 16, w: 112, h: 40, rx: 20, name: l.you, kind: 'input' }),
        node({ x: 56, y: 88, w: 240, h: 48, ...ns(l.main), kind: 'focal' }),
        ...l.helpers.map((pair, i) => node({ x: 96, y: mids[i] - 24, w: 208, h: 48, ...ns(pair) })),
      ],
    }
  },
}
