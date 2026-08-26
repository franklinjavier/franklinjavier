---
title: Oficina: um template de Grok Bot que o shadcn instala
date: 2026-08-25
description: Um item hoje, orchestrator. O CLI oficial puxa do GitHub. Sem domínio próprio e sem instalador nosso.
author: Franklin Javier
tags: grok-bot, shadcn, oficina, registry
lang: pt-br
translationKey: oficina-template-shadcn
---

Publiquei um registry de template de Grok Bot em [github.com/franklinjavier/oficina](https://github.com/franklinjavier/oficina). O instalador não é meu. É o [CLI do shadcn](https://ui.shadcn.com/docs/cli).

```bash
npx shadcn@latest add franklinjavier/oficina/orchestrator
```

Isso grava `oficina/bots/orchestrator/*` no diretório em que o comando roda. No `files[].target` do shadcn, `~/` é o cwd do projeto, não o `$HOME`.

[O post das skills](/pt-br/blog/skills-open-source-para-agentes/) era markdown para agente de código. Este é outra coisa: um snapshot de bot que você aplica na mão no Grok Bot.

## Um item, de propósito

Hoje o registry tem um item, `orchestrator`. Tipo `registry:item`. Snapshot inventado de um coordenador de frota chamado Helm. Perfil, avatar geométrico, ponteiros de skill (e um corpo genérico `route-work`), dois templates de rotina desligados.

Não vem histórico de conversa. Não vem memória. Não vem credencial, token, nome de gente de verdade.

Eu quase fiz um CLI. Quase pus um domínio. Os dois saíram. Qualquer um publica do mesmo jeito no GitHub dele. A Oficina é o exemplo.

## Instalar, olhar, não escrever

Além do `add`:

```bash
npx shadcn@latest view franklinjavier/oficina/orchestrator
npx shadcn@latest search franklinjavier/oficina
npx shadcn@latest list franklinjavier/oficina
npx shadcn@latest add franklinjavier/oficina/orchestrator --dry-run
npx shadcn@latest add franklinjavier/oficina/orchestrator#main
```

O `#main` trava revisão. O `--dry-run` mostra o que iria para o disco. O CLI lê o `registry.json` da raiz do repositório público. Não precisa de domínio.

O [primeiro PR](https://github.com/franklinjavier/oficina/pull/1) entrou em 25 de agosto de 2026, commit [`2bc4973`](https://github.com/franklinjavier/oficina/commit/2bc4973cea33d076000a1a2d930f8dea0577d3ed).

## Depois do add, a mão

Os arquivos caem em `oficina/bots/orchestrator/`. Aí você aplica no Grok Bot:

1. Cria um bot.
2. Clica no nome no header do chat, ou Cmd+Shift+I. A engrenagem ao lado do X do painel abre as Settings: avatar, name, title, description.
3. Copia `name`, `title` e `description` do `profile.json`. Avatar opcional a partir do `avatar.svg`.
4. Liga as skills que fizerem sentido. Ponteiro sem corpo é dica, não dump.
5. Cria as rotinas a partir dos templates, só depois de preencher as fontes locais. Deixa desligado até um teste seguro.

Kit de partida. Não é export de um agente ao vivo.

## O que o registry não vai mandar

- Segredo, token, login
- Banco de agente ao vivo ou estado da máquina
- Log de memória ou histórico de conversa
- Nome de gente de verdade

Tem um segundo PR aberto no repo. Não está no ar. Não é este post.
