---
title: Publicamos 36 das nossas skills de agente como open source
date: 2026-08-22
description: As skills internas do Stone Giant Studio para agentes de código agora são públicas - arquivos markdown, sem dependências, portáveis entre Claude Code, Cursor, Codex e Gemini CLI.
author: Franklin Javier
tags: ia, agentes, open-source, tooling
lang: pt-br
translationKey: open-source-agent-skills
---

No Stone Giant Studio a gente acumulou um toolchain privado para agentes de código — aquele "é assim que a gente faz isso aqui" que a gente reensinava a cada nova sessão de agente. Publicamos 36 dessas skills sob Apache-2.0 em [github.com/stonegiantstudio/skills](https://github.com/stonegiantstudio/skills).

## O que é uma skill, na prática

Uma skill é um arquivo markdown. O formato é esse, inteiro.

Sem binários, sem runtime, sem dependência para instalar. Segue a especificação [agentskills.io](https://agentskills.io), o que significa que o mesmo arquivo funciona em Claude Code, Cursor, Codex, Gemini CLI e numa lista longa de outros.

Isso parece simples demais para ser útil, e essa reação merece ser examinada. O gargalo ao trabalhar com um agente de código raramente é capacidade. É contexto: o agente não conhece as suas convenções, o seu padrão de revisão, nem as três arestas afiadas da biblioteca que você usa. Uma skill é exatamente esse conhecimento, escrito uma vez, num lugar que o agente lê sozinho.

A portabilidade importa mais do que parece. Ferramenta nessa área gira rápido. Conhecimento codificado em markdown sobrevive a uma troca de agente; conhecimento codificado como plugin de um fornecedor só, não.

## Instalando

No Claude Code, registre o marketplace e instale o plugin:

```bash
claude plugin marketplace add stonegiantstudio/skills
claude plugin install stone-giant@stone-giant-studio-skills
```

Os comandos chegam com namespace, no formato `/stone-giant:park`.

Em qualquer outro agente:

```bash
npx skills add stonegiantstudio/skills
```

Ali os comandos vêm sem prefixo — `/park`. Use um método ou o outro, não os dois, senão você acaba com duplicatas.

## Os dois tipos

**Comandos interativos**, que você chama de propósito:

- `/park` — um ritual de encerramento. Ele captura o estado do que você estava fazendo, para que o trabalho inacabado pare de ocupar sua atenção depois que você fecha o notebook. Esse é o que eu não esperava que fosse importar e é o que mais uso.
- `/score` — avaliação de um artefato por rubrica, com iteração automática até bater um nível de qualidade alvo.
- `/eval-npm` — análise de dependência cruzando sinais de manutenção, segurança e custo de bundle, para que "vale a pena adicionar esse pacote" vire uma pergunta com dado.
- `/seo-geo-aeo` — avaliação de visibilidade em busca cruzando Google, GA4 e dados de ameaça.

**Skills auto-acionadas**, que carregam quando o contexto pede, sem você chamar:

- `npm-security-advisory` — detecção de anomalia de supply chain que dispara antes dos feeds de ameaça acompanharem.
- `ci-performance` — análise de caminho crítico de pipeline, em vez de chutar qual job paralelizar.
- `react-router-v7`, `js-ninja`, `zod-ninja`, `testing-ninja`, `design-ninja` — padrões de framework e de linguagem.
- `drizzle-migrations`, `signup-signin` — migrações PostgreSQL entre ambientes, e UX de autenticação cobrindo OTP, passkeys e fluxos de recuperação.

Além dessas, o repositório cobre banco e infraestrutura (PostgreSQL, SQL Server, Kysely, Lambda, Better Auth, Resend), escrita e produto, e um conjunto de PDF para extração, criação e visualização em relatórios.

## Por que publicar

Dois motivos, e o segundo é o honesto.

O primeiro é que a maior parte disso não é proprietária. A skill que explica como escrever um teste comportamental não é vantagem competitiva; é a descrição de uma boa prática que por acaso foi escrita para um leitor de máquina. Manter privado não ajuda ninguém.

O segundo é que publicar força qualidade. Uma skill que só eu leio pode ser vaga e ainda funcionar, porque eu preencho as lacunas de memória. Uma skill que o agente de outra pessoa lê, não pode. Passar por 36 delas com essa lente revelou problemas de verdade — instruções que só faziam sentido dado um contexto que a gente nunca tinha escrito.

Se você usar e algo estiver confuso, isso é um bug. Issues e pull requests estão abertos.
