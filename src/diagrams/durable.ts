import { eyebrow, label, node, path, type Diagram } from './svg'

// Paired traces of the same three steps with a crash at step 3. The job queue
// restarts and repeats steps 1 and 2; the durable workflow resumes at step 3
// (focal).
const t = {
  en: {
    queue: 'JOB QUEUE',
    durable: 'DURABLE WORKFLOW',
    crash: '✕ crash',
    again: 'again',
    saved: 'saved',
    restarts: 'RESTARTS',
    resumes: 'RESUMES',
  },
  'pt-br': {
    queue: 'FILA DE JOBS',
    durable: 'WORKFLOW DURÁVEL',
    crash: '✕ queda',
    again: 'de novo',
    saved: 'salvo',
    restarts: 'REINICIA',
    resumes: 'RETOMA',
  },
}

const X = [56, 144, 232]

export const durable: Diagram = {
  title: {
    en: 'Job queue vs. durable workflow',
    'pt-br': 'Fila de jobs vs. workflow durável',
  },
  desc: {
    en: 'After a crash at step 3, a job queue restarts and runs steps 1 and 2 again, while a durable workflow, having saved steps 1 and 2, resumes at step 3.',
    'pt-br':
      'Depois de uma queda no passo 3, a fila de jobs reinicia e roda os passos 1 e 2 de novo, enquanto o workflow durável, que salvou os passos 1 e 2, retoma no passo 3.',
  },
  caption: {
    en: 'The same crash at step 3. A job queue repeats the finished steps; a durable workflow resumes where it stopped. In the lecture the engine is Temporal, and steps must be idempotent.',
    'pt-br':
      'A mesma queda no passo 3. A fila de jobs repete os passos já feitos; o workflow durável retoma de onde parou. Na aula, o motor é o Temporal, e os passos precisam ser idempotentes.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    // One row of three steps at y; `subs` labels each step (undefined = none).
    const row = (y: number, subs: (string | undefined)[]) => [
      path(id, `M120,${y + 24} H144`),
      path(id, `M208,${y + 24} H232`),
      ...X.map((x, i) => node({ x, y, w: 64, h: 48, name: String(i + 1), sub: subs[i] })),
    ]
    return {
      height: 404,
      body: [
        eyebrow(16, 28, l.queue),
        path(id, 'M264,88 V100 Q264,108 256,108 H96 Q88,108 88,116 V140'),
        label(l.restarts, 'below', { x: 176, y: 108 }),
        ...row(40, [undefined, undefined, l.crash]),
        ...row(140, [l.again, l.again, undefined]),
        eyebrow(16, 228, l.durable),
        path(id, 'M264,288 V340', 'accent'),
        label(l.resumes, 'left', { x: 264, y: 312 }, true),
        ...row(240, [l.saved, l.saved, l.crash]),
        node({ x: 56, y: 340, w: 64, h: 48, name: '1', kind: 'ghost' }),
        node({ x: 144, y: 340, w: 64, h: 48, name: '2', kind: 'ghost' }),
        node({ x: 232, y: 340, w: 64, h: 48, name: '3', kind: 'focal' }),
      ],
    }
  },
}
