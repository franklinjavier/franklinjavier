---
title: Publicamos 36 das nossas skills de agente como open source
date: 2026-08-22
description: As skills internas do Stone Giant Studio para agentes de código agora são públicas - arquivos markdown, sem dependências, portáveis entre Claude Code, Cursor, Codex e Gemini CLI.
author: Franklin Javier
tags: ia, agentes, open-source, tooling
lang: pt-br
translationKey: open-source-agent-skills
---

No Stone Giant Studio a gente foi juntando um toolchain privado para agentes de código. Todo aquele "aqui a gente faz assim" que a gente reensinava a cada nova sessão de agente. Colocamos 36 dessas skills sob Apache-2.0 em [github.com/stonegiantstudio/skills](https://github.com/stonegiantstudio/skills).

## Uma skill é um arquivo markdown

O formato é esse, inteiro. Sem binário, sem runtime, nada para instalar.

Ele segue a especificação do [agentskills.io](https://agentskills.io), então o mesmo arquivo funciona no Claude Code, Cursor, Codex, Gemini CLI e numa lista longa de outros.

Parece simples demais para servir para alguma coisa, eu sei. Mas pensa em onde você perde tempo de verdade com um agente de código. Raramente é capacidade. É que o agente não conhece as suas convenções, o seu nível de revisão, nem as três arestas afiadas da biblioteca que você usa. Uma skill é esse conhecimento, escrito uma vez, num lugar que o agente lê sozinho.

A portabilidade importa mais do que parece. Ferramenta nessa área gira rápido. Conhecimento num arquivo markdown sobrevive à sua troca de agente. Conhecimento no plugin de um fornecedor só, não.

## Instalando

No Claude Code, pelo sistema de plugin:

```bash
claude plugin marketplace add stonegiantstudio/skills
claude plugin install stone-giant@stone-giant-studio-skills
```

Os comandos vêm com namespace, tipo `/stone-giant:park`.

Em todo o resto:

```bash
npx skills add stonegiantstudio/skills
```

Ali eles vêm sem prefixo, `/park`. Escolha um método, não os dois, senão você fica com duplicata.

## O que tem lá dentro

Algumas você chama de propósito:

- `/park` é um ritual de encerramento. Ele captura o estado do que você estava fazendo para o trabalho inacabado parar de rodar na sua cabeça depois que você fecha o notebook. Eu não esperava me importar com essa e é a que mais uso.
- `/score` avalia um artefato contra uma rubrica e itera até bater um alvo.
- `/eval-npm` olha manutenção, segurança e custo de bundle juntos, então "vale a pena adicionar esse pacote" vira uma pergunta com dado atrás.
- `/seo-geo-aeo` avalia visibilidade em busca cruzando Google, GA4 e dados de ameaça.

Outras carregam sozinhas quando o contexto pede. A `npm-security-advisory` pega anomalia de supply chain antes dos feeds de ameaça. A `ci-performance` faz análise de caminho crítico do seu pipeline em vez de você chutar qual job paralelizar. Depois tem `react-router-v7`, `js-ninja`, `zod-ninja`, `testing-ninja`, `design-ninja` para padrão de framework e de linguagem, `drizzle-migrations` para migração PostgreSQL entre ambientes, e `signup-signin` para UX de autenticação com OTP, passkeys e fluxo de recuperação.

O resto cobre banco e infraestrutura, escrita e produto, e um conjunto de PDF para extração e relatório.

## Por que publicar

Dois motivos, e o segundo é o de verdade.

A maior parte disso não é proprietária. A skill que explica como escrever um teste comportamental não é vantagem competitiva. É boa prática, escrita para um leitor de máquina em vez de um humano. Manter privado não ajuda ninguém.

O segundo motivo é que publicar força qualidade. Uma skill que só eu leio pode ser vaga e ainda funcionar, porque eu preencho as lacunas de memória sem perceber. Uma skill que o agente de outra pessoa lê, não pode. Passar pelas 36 com isso na cabeça revelou problemas de verdade: instruções que só faziam sentido se você já soubesse coisas que a gente nunca tinha escrito em lugar nenhum.

Se você usar e alguma coisa estiver confusa, isso é um bug. Issues e pull requests estão abertos.
