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
      ['Cloud coding agent', 'muda código na própria VM'],
    ],
  },
}

export const helpers: Diagram = {
  title: {
    en: 'Main agent and helpers',
    'pt-br': 'Agente principal e helpers',
  },
  desc: {
    en: 'You talk to the main agent, which sends full task descriptions to general, computer-use, video and cloud coding helpers and gets short reports back.',
    'pt-br':
      'Você conversa com o agente principal, que manda descrições completas de tarefas aos helpers geral, de uso de computador, de vídeo e de código na nuvem e recebe relatórios curtos de volta.',
  },
  caption: {
    en: 'The main agent keeps talking to you while helpers work. It can check on a helper, send it a message, or stop it.',
    'pt-br':
      'O agente principal continua falando com você enquanto os helpers trabalham. Ele pode consultar um helper, mandar mensagem a ele ou pará-lo.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    const mids = [228, 296, 364, 432]
    return {
      height: 476,
      body: [
        path(id, 'M160,56 V88'),
        path(id, 'M192,88 V56'),
        // task descriptions down the left trunk, reports up the right one
        path(id, 'M72,144 V424 Q72,432 80,432 H96'),
        ...mids.slice(0, 3).map((y) => path(id, `M72,${y} H96`)),
        path(id, 'M304,432 H312 Q320,432 320,424 V124 Q320,116 312,116 H296'),
        ...mids.slice(0, 3).map((y) => path(id, `M304,${y} H320`, 'muted', false)),
        label(l.task, 'right', { x: 72, y: 160 }),
        label(l.report, 'left', { x: 320, y: 184 }),
        node({ x: 120, y: 16, w: 112, h: 40, rx: 20, name: l.you, kind: 'input' }),
        node({ x: 56, y: 88, w: 240, h: 56, ...ns(l.main), kind: 'focal' }),
        ...l.helpers.map((pair, i) => node({ x: 96, y: mids[i] - 28, w: 208, h: 56, ...ns(pair) })),
      ],
    }
  },
}
