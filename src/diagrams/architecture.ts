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
    saved: ['Estado salvo', 'banco + arquivos'],
    vm: 'COMPUTADOR DO AGENTE · VM',
    runner: ['Executor de comandos', 'shell · arquivos · screenshots · cliques'],
    files: ['Servidor de arquivos', 'arquivos · conexões · visão ao vivo'],
    desktop: ['Desktop + Chrome', 'uma tela virtual por agente'],
    live: 'ATUALIZAÇÕES',
    tools: 'CHAMADAS DE FERRAMENTAS',
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
      'Os apps mandam eventos ao servidor, onde a entrada, a fila de cada conversa e o loop do agente salvam cada passo no estado salvo; o loop responde por SendToUser, o estado salvo manda atualizações ao vivo para os apps e as chamadas de ferramentas vão para a VM do agente, com executor de comandos, servidor de arquivos e um desktop com Chrome por agente.',
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
      height: 560,
      body: [
        // zones
        `<rect x="8" y="80" width="336" height="240" rx="8" class="dg-zone"/>`,
        `<rect x="8" y="344" width="336" height="208" rx="8" class="dg-zone dg-zone-dashed"/>`,
        eyebrow(324, 100, l.server, 'end'),
        eyebrow(324, 364, l.vm, 'end'),
        // connectors
        path(id, 'M92,64 V112'),
        path(id, 'M92,160 V184'),
        path(id, 'M92,232 V256'),
        path(id, 'M160,288 H196'),
        path(id, 'M160,272 H176 Q184,272 184,264 V64'),
        path(id, 'M324,280 Q332,280 332,272 V48 Q332,40 324,40 H288', 'dashed'),
        path(id, 'M92,304 V376'),
        label('SendToUser', 'right', { x: 184, y: 136 }),
        label(l.live, 'left', { x: 332, y: 216 }),
        // between the two zones, clear of both borders
        label(l.tools, 'right', { x: 92, y: 332 }),
        // nodes
        node({ x: 24, y: 16, w: 264, h: 48, ...ns(l.apps), kind: 'input' }),
        node({ x: 24, y: 112, w: 136, h: 48, ...ns(l.entry) }),
        node({ x: 24, y: 184, w: 136, h: 48, ...ns(l.queue) }),
        node({ x: 24, y: 256, w: 136, h: 48, ...ns(l.loop) }),
        node({ x: 196, y: 256, w: 128, h: 48, ...ns(l.saved), kind: 'focal' }),
        node({ x: 24, y: 376, w: 304, h: 48, ...ns(l.runner) }),
        node({ x: 24, y: 432, w: 304, h: 48, ...ns(l.files) }),
        node({ x: 24, y: 488, w: 304, h: 48, ...ns(l.desktop) }),
      ],
    }
  },
}
