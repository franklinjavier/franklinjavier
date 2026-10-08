---
title: MacBook velho virou servidor de contexto
date: 2026-10-08
description: Um MacBook Pro de 2017, de tampa fechada na tomada, passou a guardar o contexto de trabalho entre máquinas, projetos e agentes. Do celular eu abro uma sessão de código, e qualquer agente retoma de onde o outro parou.
author: Franklin Javier
tags: ia, agentes, self-hosting, tooling, produtividade
lang: pt-br
translationKey: old-macbook-context-server
---

Eu tinha um MacBook Pro de 2017 parado. Intel i5, 8 GB de RAM, macOS 13. Hoje ele fica de tampa fechada, na tomada, ligado o dia inteiro, e virou a peça mais útil do meu jeito de trabalhar.

Rápido ele não é. O que ele faz é guardar uma coisa que eu vivia perdendo: **contexto**.

Eu trabalho em mais de uma máquina, em vários projetos, com vários agentes: Claude Code, Codex, um agente pessoal no Telegram e o grok bot, um agente autônomo que roda na nuvem. Cada um começava do zero. Agora todos escrevem e leem do mesmo lugar, e qualquer um retoma de onde o outro parou.

Na prática, não preciso carregar um MacBook para construir coisas. Do celular eu abro uma sessão de código no servidor, e quando sento no outro Mac o agente de lá já sabe o que aconteceu.

## O hardware

Nada de especial:

- MacBook Pro 2017, i5, 8 GB de RAM, macOS 13;
- tampa fechada, na tomada, 24/7;
- sleep desativado e limite de carga na bateria, para ela não estufar.

Eu tinha medo de que ele esquentasse de tampa fechada. Testei: mais de uma hora fechado, com tudo rodando, a CPU não sofreu thermal throttling, a bateria ficou por volta de 31 °C, o load em torno de 0,7 e sobravam 67% de memória livre.

Ele substituiu uma VPS que eu alugava só para rodar meu agente pessoal. Troquei porque queria o hardware sob meu controle e tudo num lugar só.

## A arquitetura, por alto

**Tudo em Docker.** Rodo via Colima, uma VM leve no Mac. Foi de propósito: se um dia esse "servidor" virar um desktop Linux em casa, os mesmos arquivos compose sobem lá sem retrabalho. O Mac é um detalhe: se eu quiser aposentar o MacBook, a migração para uma VPS ou uma máquina Linux é restaurar o backup e subir os mesmos composes.

**Rede privada, nenhuma porta aberta.** O servidor, meu outro Mac, o celular e o grok bot estão numa rede privada com Tailscale. Para falar com o servidor, você precisa estar dentro dela.

**Uma única entrada pública.** Um túnel da Cloudflare deixa passar só os webhooks do GitHub que alimentam o revisor de código, filtrados por caminho e com assinatura verificada. O resto fica fechado.

Os serviços sobem sozinhos no boot, pelo launchd. Testei reiniciar a máquina e derrubar o Wi-Fi, e tudo voltou sem eu encostar.

## O que roda lá

- **Um agente pessoal no Telegram**, com perfis separados: um pessoal, um revisor de código e um para assuntos do condomínio. Cada perfil tem só a permissão de que precisa. O do condomínio, por exemplo, não enxerga o GitHub.
- **Um revisor de código automático.** Quando um PR pede minha revisão, o GitHub chama o webhook e o agente revisa. Os clones dos repositórios ficam no servidor e servem também para desenvolver lá. O `node_modules` é reaproveitado entre as worktrees de revisão, senão o disco não aguenta.
- **A automação da casa.** Uns relés Shelly, expostos para os agentes via MCP.
- **Claude Code acessível pelo celular**, com Remote Control, sobrevivendo a reboots. Parte da sessão em que montei tudo isso foi tocada pelo iPhone.
- **A memória compartilhada**, que é o motivo deste post.

## Contexto compartilhado

Um servidor de memória roda nesse Mac. Hoje ele recebe o Claude Code do próprio servidor, o Claude Code e o Codex do meu outro Mac, o agente do Telegram e o grok bot, que tem uma máquina própria na nuvem e desenvolve usando o Claude Code CLI de lá.

Uso o [ai-memory](https://github.com/akitaonrails/ai-memory) para isso, mas daria para trocar a ferramenta. O que eu queria era o fluxo.

### Ninguém precisa mandar salvar

Hooks gravam cada sessão de código automaticamente. As sessões que importam são resumidas por um LLM. Uso a minha assinatura do ChatGPT/Codex para isso, sem API paga.

O projeto é inferido pelo repositório onde a sessão rodou. Quando o grok bot trabalha no repositório X, eu vejo isso ao abrir o repositório X em qualquer máquina, e o contrário também vale.

### Toda sessão começa sabendo o que aconteceu antes

Ao abrir uma sessão, o agente recebe um resumo do que foi feito naquele projeto, inclusive por outro agente, em outra máquina. E existe o handoff: um agente deixa o bastão explícito para o próximo, com o que falta fazer e o que não pode ser esquecido.

Este post começou assim. O Claude Code do servidor deixou um briefing, e o agente que cuida do meu site pegou dali.

Hoje aconteceu outro caso. Meu outro Mac dormiu no meio de uma tarefa do Codex. Do celular, pedi ao Claude Code do servidor para descobrir onde tinha parado. Ele achou na memória os pedidos completos que o Codex tinha feito ao Claude Code, com o texto exato das mudanças que ficaram sem commit, e conferiu no GitHub o que já tinha subido no PR e o que não.

![Um só lugar para o contexto: o outro Mac, o grok bot e o agente no Telegram leem e gravam na memória compartilhada do MacBook velho; o celular abre sessões do Claude Code nesse mesmo MacBook](/images/blog/macbook-velho-virou-servidor-de-contexto/fluxo-contexto.svg)

### O passado também entrou

Importei sessões antigas, inclusive de worktrees que eu já tinha apagado depois do merge. Para isso, recriei as pastas temporariamente. Só de um projeto foram umas 189 sessões, todas resumidas sem nenhum erro, gastando uma fração pequena do limite da assinatura.

É o tipo de coisa que eu quero: resolver uma integração com Stripe num projeto e ter a solução à mão quando o mesmo problema aparecer em outro.

### A regra que impede a memória de mentir

Memória de agente tem um risco óbvio: informação velha virando afirmação confiante.

Por isso todo agente tem a mesma instrução. O que vem da memória é **histórico**, não o estado atual. Antes de afirmar qualquer coisa sobre código, configuração ou comando, ele confere no repositório e no `git log`, separa o que confirmou agora do que só lembrou, e avisa quando a memória diverge.

Sem essa regra, eu não confiaria no resto.

### Permissão de acordo com o risco

O grok bot pode buscar, ler e gravar memória. Não pode apagar páginas nem disparar resumos com LLM, que gastam a minha cota.

Em troca, ele lê tudo, inclusive o contexto dos outros projetos. Aceitei esse trade-off sabendo disso. Se um dia deixar de fazer sentido, ele sai.

### Teste do ping-pong

Para ter certeza de que funcionava, cada lado deixou uma "senha" para o outro achar.

O grok bot achou a que o servidor deixou. O servidor achou duas: a que o grok bot gravou de propósito e uma que ele só *mencionou* numa conversa, que os hooks capturaram sozinhos. Na sessão seguinte, o grok bot já sabia da conversa anterior sem ninguém pedir para salvar nada. Foi aí que eu entendi que tinha funcionado.

## Backup, monitoramento e lembretes

Criei uma rotina de **backup diário e criptografado** para um object storage. Ficam de fora `node_modules` e worktrees. Os bancos SQLite entram como snapshots consistentes. A retenção é de 7 diários, 4 semanais e 3 mensais, com um teto rígido de 8 GB para nunca sair do plano gratuito de 10 GB. O primeiro backup deu uns 0,75 GB.

**Monitoramento a cada 5 minutos**, com alerta no Telegram só quando algo muda: container caiu, disco, memória, backup atrasado, Mac fora da tomada, temperatura, thermal throttling, falha do LLM de resumo. Um dead-man switch no [healthchecks.io](https://healthchecks.io) avisa se o servidor inteiro sumir. Fiz um teste rápido desligando o Wi-Fi, e o alerta pingou no Telegram.

Também deixei **lembretes agendados** que avisam no Telegram quando for hora de desligar a VPS antiga (e parar de pagar) e de renovar os tokens do GitHub.

## O que deu errado no caminho

- **Homebrew em Mac Intel.** Em setembro de 2026 ele deixou de instalar em Macs Intel. Instalei tudo por binários oficiais, conferindo checksum.
- **Falso alarme no boot.** Os containers demoram para subir depois de reiniciar, então o monitor ignora alertas de Docker nos primeiros 10 minutos.
- **A máquina do grok bot não tem systemd.** O PID 1 é um `tini`, e a máquina é recriada a cada update, mas a home persiste. A saída foi instalar o cliente do Tailscale dentro da home e subi-lo por um hook do próprio Claude Code no início de cada sessão.
- **Assinaturas de IA.** Usar a conta do ChatGPT/Codex para os resumos foi tranquilo. Usar a assinatura do Claude fora dos apps oficiais eu descartei, pelo risco nos termos de uso.

## Onde fica o contexto

Docker, rede privada, backup e monitoramento existem há anos. Nenhuma peça aqui é nova.

O que eu fiz foi juntar essas peças em volta de uma pergunta: onde fica o contexto do meu trabalho? Antes ele ficava espalhado em sessões que morriam quando eu fechava o terminal. Agora fica num MacBook velho, de tampa fechada, que todo agente consulta antes de começar e atualiza quando termina. E como cada agente confere o que lembra antes de afirmar, dá para confiar nele.

Eu abro uma sessão pelo celular, sento em outra máquina mais tarde ou deixo o grok bot trabalhando sozinho, e o trabalho continua de onde parou.
