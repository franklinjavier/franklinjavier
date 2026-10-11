import { eyebrow, label, node, ns, path, type Diagram } from './svg'

// Apps → server (entry, queue, loop, saved state) → the agent's VM.
// Focal: saved state, because everything lives on the server and the VM can
// always be rebuilt.
const t = {
  en: {
    apps: ['Apps and channels', 'desktop · web · Slack · email'],
    server: 'SERVER',
    entry: ['Entry point', 'checks, routes'],
    queue: ['Queue', 'per conversation'],
    loop: ['Agent loop', 'calls the model'],
    saved: ['Saved state', 'DB + storage'],
    vm: "AGENT'S COMPUTER · VM",
    runner: ['Command runner', 'shell · files · screenshots · clicks'],
    files: ['File server', 'files · app connections · live view'],
    desktop: ['Desktop + Chrome', 'one virtual screen per agent'],
    live: 'LIVE UPDATES',
    tools: 'TOOL CALLS',
  },
  'pt-br': {
    apps: ['Apps e canais', 'desktop · web · Slack · email'],
    server: 'SERVIDOR',
    entry: ['Entrada', 'valida, roteia'],
    queue: ['Fila', 'uma por conversa'],
    loop: ['Loop do agente', 'chama o modelo'],
    saved: ['Estado salvo', 'banco + storage'],
    vm: 'COMPUTADOR DO AGENTE · VM',
    runner: ['Executor de comandos', 'shell · arquivos · screenshots · cliques'],
    files: ['Servidor de arquivos', 'arquivos · conexões · visão ao vivo'],
    desktop: ['Desktop + Chrome', 'uma tela virtual por agente'],
    live: 'ATUALIZAÇÕES',
    tools: 'TOOL CALLS',
  },
}

export const architecture: Diagram = {
  title: {
    en: 'Always-on agent architecture',
    'pt-br': 'Arquitetura do agente sempre ligado',
  },
  desc: {
    en: "Apps send events to a server whose entry point, per-conversation queue and agent loop save every step as stored state; the loop replies through SendToUser, stored state pushes live updates to the apps, and tool calls go to the agent's VM with a command runner, a file server and one desktop with Chrome per agent.",
    'pt-br':
      'Os apps mandam eventos ao servidor, onde a entrada, a fila de cada conversa e o loop do agente salvam cada passo no estado salvo; o loop responde por SendToUser, o estado salvo manda atualizações ao vivo para os apps e as tool calls vão para a VM do agente, com executor de comandos, servidor de arquivos e um desktop com Chrome por agente.',
  },
  caption: {
    en: "Three parts: the apps, the server that runs the agent, and the agent's computer. State lives on the server, so the VM can always be rebuilt.",
    'pt-br':
      'Três partes: os apps, o servidor que roda o agente e o computador do agente. O estado fica no servidor, então a VM sempre pode ser reconstruída.',
  },
  lecture: true,
  draw(lang, id) {
    const l = t[lang]
    return {
      height: 608,
      body: [
        // zones
        `<rect x="8" y="88" width="336" height="264" rx="8" class="dg-zone"/>`,
        `<rect x="8" y="368" width="336" height="232" rx="8" class="dg-zone dg-zone-dashed"/>`,
        eyebrow(324, 108, l.server, 'end'),
        eyebrow(324, 388, l.vm, 'end'),
        // connectors
        path(id, 'M92,72 V120'),
        path(id, 'M92,176 V200'),
        path(id, 'M92,256 V280'),
        path(id, 'M160,320 H208'),
        path(id, 'M160,296 H176 Q184,296 184,288 V72'),
        path(id, 'M324,300 Q332,300 332,292 V52 Q332,44 324,44 H288', 'dashed'),
        path(id, 'M92,336 V400'),
        label('SendToUser', 'right', { x: 184, y: 148 }),
        label(l.live, 'left', { x: 332, y: 228 }),
        label(l.tools, 'right', { x: 92, y: 352 }),
        // nodes
        node({ x: 24, y: 16, w: 264, h: 56, ...ns(l.apps), kind: 'input' }),
        node({ x: 24, y: 120, w: 136, h: 56, ...ns(l.entry) }),
        node({ x: 24, y: 200, w: 136, h: 56, ...ns(l.queue) }),
        node({ x: 24, y: 280, w: 136, h: 56, ...ns(l.loop) }),
        node({ x: 208, y: 280, w: 116, h: 56, ...ns(l.saved), kind: 'focal' }),
        node({ x: 24, y: 400, w: 304, h: 56, ...ns(l.runner) }),
        node({ x: 24, y: 464, w: 304, h: 56, ...ns(l.files) }),
        node({ x: 24, y: 528, w: 304, h: 56, ...ns(l.desktop) }),
      ],
    }
  },
}
