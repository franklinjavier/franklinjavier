---
title: MacBook velho virou servidor de contexto
date: 2026-10-08
description: Um MacBook Pro de 2017, de tampa fechada na tomada, guarda o histórico das sessões dos meus agentes em várias máquinas e vários projetos. Quando uma tarefa para no meio, o próximo agente parte de um resumo e é instruído a conferir o estado atual no repositório.
author: Franklin Javier
tags: ia, agentes, self-hosting, tooling, produtividade
lang: pt-br
translationKey: old-macbook-context-server
---

Meu outro Mac dormiu no meio de uma tarefa do Codex. Do celular, pedi ao Claude Code, rodando num MacBook antigo, para descobrir onde o trabalho tinha parado. Ele achou na memória compartilhada os pedidos completos que o Codex tinha feito ao Claude Code, com o texto exato das mudanças que ficaram sem commit, e conferiu no GitHub o que já tinha subido no PR e o que não.

Esse MacBook é um Pro de 2017, com 8 GB de RAM. Fica de tampa fechada, na tomada, ligado o dia inteiro, e guarda o histórico das sessões dos agentes com que eu trabalho.

São vários: Claude Code, Codex, um agente pessoal no Telegram e o grok bot, um agente autônomo que roda na nuvem. Estão em mais de uma máquina e em vários projetos, e cada um começava do zero. Agora todos gravam e leem no mesmo lugar, e quem pega o trabalho começa com um resumo do que o anterior fez.

Na prática, não preciso carregar um MacBook para construir coisas: do celular eu abro uma sessão de código no servidor.

## O hardware

Nada de especial:

- MacBook Pro 2017, i5, 8 GB de RAM, macOS 13;
- tampa fechada, na tomada, 24/7;
- sleep desativado e limite de carga na bateria, para reduzir o desgaste.

Eu tinha medo de que ele esquentasse de tampa fechada. Num teste de mais de uma hora, de tampa fechada e com tudo rodando, a CPU não sofreu thermal throttling, a bateria ficou por volta de 31 °C, o load em torno de 0,7 e sobravam 67% de memória livre.

Ele substituiu uma VPS que eu alugava só para rodar meu agente pessoal. Troquei porque queria o hardware sob meu controle e tudo num lugar só.

## A arquitetura, por alto

**Tudo em Docker.** Rodo via Colima, uma VM leve no Mac. Escolhi assim pensando no dia em que eu aposentar o MacBook: a ideia é restaurar o backup num desktop Linux em casa ou numa VPS e subir lá os mesmos arquivos compose. O que roda fora dos containers, como os serviços do launchd, não iria junto com os arquivos compose.

**Rede privada.** O servidor, meu outro Mac, o celular e o grok bot estão numa rede privada com Tailscale, e é por ela que eu acesso o servidor. A exceção pública é um túnel da Cloudflare que deixa passar só os webhooks do GitHub que alimentam o revisor de código, filtrados por caminho e com assinatura verificada.

Os serviços sobem sozinhos no boot, pelo launchd. Testei reiniciar a máquina e derrubar o Wi-Fi, e tudo voltou sem eu encostar.

## O que roda lá

- **Um agente pessoal no Telegram**, com perfis separados: um pessoal, um revisor de código e um para assuntos do condomínio. Cada perfil tem só a permissão de que precisa. O do condomínio, por exemplo, não enxerga o GitHub.
- **Um revisor de código automático.** Quando um PR pede minha revisão, o GitHub chama o webhook e o agente revisa. Os clones dos repositórios ficam no servidor e servem também para desenvolver lá. O `node_modules` é compartilhado entre as worktrees de revisão, para não duplicar dependências a cada worktree e lotar o disco.
- **A automação da casa.** Uns relés Shelly, expostos para os agentes via MCP.
- **Claude Code acessível pelo celular**, com Remote Control, sobrevivendo a reboots. Parte da sessão em que montei tudo isso foi tocada pelo iPhone.
- **A memória compartilhada**, que é o motivo deste post.

## Contexto compartilhado

Um servidor de memória roda nesse Mac. Hoje ele recebe registros das sessões do Claude Code do próprio servidor, do Claude Code e do Codex do meu outro Mac, do agente do Telegram e do grok bot, que tem uma máquina própria na nuvem e desenvolve usando o Claude Code CLI de lá.

Uso o [ai-memory](https://github.com/akitaonrails/ai-memory) para isso, mas daria para trocar a ferramenta. O que eu queria era o fluxo.

### Ninguém precisa mandar salvar

Hooks gravam cada sessão de código automaticamente. As sessões que importam são resumidas por um LLM. Uso a minha assinatura do ChatGPT/Codex para isso, sem API paga.

O projeto é inferido pelo repositório onde a sessão rodou. Quando o grok bot trabalha no repositório X, eu vejo isso ao abrir o repositório X em qualquer máquina, e o contrário também vale.

### Cada sessão começa com um resumo

Ao abrir uma sessão, o agente recebe um resumo do que foi feito naquele projeto, inclusive por outro agente, em outra máquina. O resumo é curto, e o agente pode buscar mais na memória. Também existe o handoff: um agente registra o que falta fazer para o próximo agente e o que não pode ser esquecido.

Este post começou assim. O Claude Code do servidor deixou um briefing, e o agente que cuida do meu site pegou dali.

![Um só lugar para o contexto: o outro Mac, o grok bot e o agente no Telegram leem e gravam na memória compartilhada do MacBook velho; o celular abre sessões do Claude Code nesse mesmo MacBook](/images/blog/macbook-velho-virou-servidor-de-contexto/fluxo-contexto.svg)

### O passado também entrou

Importei sessões antigas, inclusive de worktrees que eu já tinha apagado depois do merge. Para isso, recriei as pastas temporariamente. Só de um projeto foram umas 189 sessões, e o processamento de todas terminou sem nenhuma falha, o que não garante que cada resumo esteja certo.

Quero, por exemplo, resolver uma integração com Stripe num projeto e ter a solução à mão quando o mesmo problema aparecer em outro.

### Conferir a memória no repositório

Memória de agente tem um risco óbvio: informação velha dita com toda a segurança.

Por isso todo agente recebe a mesma instrução. O que vem da memória é **histórico**, não o estado atual. Antes de afirmar qualquer coisa sobre código, configuração ou comando, ele deve conferir no repositório e no `git log`, separar o que confirmou agora do que só lembrou e avisar quando a memória diverge. No caso do Mac que dormiu, o Claude Code conferiu no GitHub o que a memória dizia.

### Permissão de acordo com o risco

O grok bot pode buscar, ler e gravar memória. Não pode apagar páginas nem disparar resumos com LLM, que gastam a minha cota.

Em troca, ele lê tudo, inclusive o contexto dos outros projetos. Aceitei esse trade-off. Se um dia deixar de fazer sentido, ele sai.

## Backup, monitoramento e lembretes

O **backup** é diário, criptografado, para um object storage. Ficam de fora `node_modules` e worktrees, e os bancos SQLite entram como snapshots consistentes. A retenção tem um teto de 8 GB, para não sair do plano gratuito de 10 GB. O primeiro backup deu uns 0,75 GB.

O **monitoramento** roda a cada 5 minutos e só manda alerta no Telegram quando algo muda: container que caiu, disco, memória, temperatura, thermal throttling, backup atrasado, Mac fora da tomada, falha do LLM de resumo. Um dead-man switch no [healthchecks.io](https://healthchecks.io) avisa se o servidor inteiro sumir. Fiz um teste desligando o Wi-Fi, e o alerta pingou no Telegram.

Uns **lembretes agendados** no Telegram avisam quando for hora de desligar a VPS antiga e de renovar os tokens do GitHub.

## O que deu errado no caminho

- **Homebrew em Mac Intel.** O [Homebrew 7.0.0](https://brew.sh/2026/09/13/homebrew-7.0.0/), de setembro de 2026, passou o macOS Intel para o Tier 3: sem suporte do projeto e sem novos bottles, os pacotes pré-compilados. Pelo cronograma, ele deve deixar de rodar em Intel em 1º de setembro de 2027. Instalei o que eu precisava por binários oficiais, conferindo checksum.
- **Falso alarme no boot.** Os containers demoram para subir depois de reiniciar, então o monitor ignora alertas de Docker nos primeiros 10 minutos.
- **A máquina do grok bot não tem systemd.** O PID 1 é um `tini`, e a máquina é recriada a cada update, mas a home persiste. A saída foi instalar o cliente do Tailscale dentro da home e subi-lo por um hook do próprio Claude Code no início de cada sessão.
- **Assinaturas de IA.** Usar a conta do ChatGPT/Codex para os resumos foi tranquilo. Descartei usar a assinatura do Claude fora dos apps oficiais, pelo risco nos termos de uso.

## Teste do ping-pong

Para ver se funcionava entre máquinas, cada lado deixou uma "senha" para o outro achar.

O grok bot achou a que o servidor deixou. O servidor achou duas: a que o grok bot gravou de propósito e uma que ele só *mencionou* numa conversa, que os hooks capturaram sozinhos. Na sessão seguinte, o grok bot já sabia da conversa anterior sem ninguém ter pedido para salvar nada.
