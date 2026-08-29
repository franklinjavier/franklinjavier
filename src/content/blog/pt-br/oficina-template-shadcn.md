---
title: "Oficina: um template de Grok Bot que o shadcn instala"
date: 2026-08-25
description: Um item, orchestrator. O CLI do shadcn puxa do GitHub. Sem domínio próprio, sem instalador meu.
author: Franklin Javier
tags: grok-bot, shadcn, oficina, registry
lang: pt-br
translationKey: oficina-template-shadcn
---

Botei um registry de template de Grok Bot no [github.com/franklinjavier/oficina](https://github.com/franklinjavier/oficina). O instalador não é meu. É o [CLI oficial do shadcn](https://ui.shadcn.com/docs/cli).

```bash
npx shadcn@latest add franklinjavier/oficina/orchestrator
```

Isso grava `oficina/bots/orchestrator/*` no diretório em que o comando roda. No `files[].target` do shadcn, `~/` é o cwd do projeto. Não é `$HOME`.

[O post das skills](/pt-br/blog/skills-open-source-para-agentes/) era markdown para agente de código. Este é outra coisa. É um snapshot de bot que você aplica na mão no Grok Bot.

## Um item só

Hoje o registry tem um item: `orchestrator`. Tipo `registry:item`. É um snapshot inventado de um coordenador de frota chamado Helm. Vem com perfil, avatar geométrico, ponteiros de skill (mais um corpo genérico `route-work`), dois templates de rotina desligados.

Não vem histórico de chat. Não vem memória. Não vem credencial nem token nem nome de gente de verdade.

Eu ia fazer um CLI. Ia comprar um domínio. Descartei os dois. Qualquer um publica do mesmo jeito no GitHub dele. A Oficina é só o exemplo.

## Olhar antes de instalar

Além do `add`, tem mais:

```bash
npx shadcn@latest view franklinjavier/oficina/orchestrator
npx shadcn@latest search franklinjavier/oficina
npx shadcn@latest list franklinjavier/oficina
npx shadcn@latest add franklinjavier/oficina/orchestrator --dry-run
npx shadcn@latest add franklinjavier/oficina/orchestrator#main
```

O `#main` fixa a branch. O `--dry-run` imprime o que iria pro disco sem gravar. O CLI lê direto do `registry.json` na raiz do repo público. Sem domínio.

O [primeiro PR](https://github.com/franklinjavier/oficina/pull/1) entrou em 25 de agosto de 2026, commit [`2bc4973`](https://github.com/franklinjavier/oficina/commit/2bc4973cea33d076000a1a2d930f8dea0577d3ed).

## Aplicar à mão

Os arquivos caem em `oficina/bots/orchestrator/`. Daí você aplica no Grok Bot:

1. Cria um bot.
2. Clica no nome no header do chat. Ou Cmd+Shift+I. A engrenagem ao lado do X do painel abre Settings: avatar, name, title, description.
3. Copia `name`, `title` e `description` do `profile.json`. Avatar é opcional, tira do `avatar.svg` se quiser.
4. Liga as skills que fazem sentido. Ponteiro sem corpo é dica, não dump.
5. Cria as rotinas a partir dos templates, só depois que você preenche as fontes locais. Deixa desligado enquanto não testar.

É um kit de partida. Não é export de um agente que está no ar.

## O que o registry não embarca

- Segredo, token, login
- Banco de agente ao vivo ou estado da máquina
- Log de memória ou histórico de conversa
- Nome de gente de verdade

Tem um segundo PR aberto no repo. Não está publicado. Não é este post.
