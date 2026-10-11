---
title: Como funciona um agente sempre ligado
date: 2026-10-11
description: A arquitetura, os gatilhos, as tools e a memória de um agente sempre ligado, a partir da aula de Lee Robinson em Stanford. Meu plano mínimo para construir um agente assim.
author: Franklin Javier
tags: ia, agentes, arquitetura, llm
lang: pt-br
translationKey: always-on-agents
---

Assisti à aula [How always-on agents work, do Lee Robinson (@leerob)](https://x.com/leerob/status/2108650243365736855), apresentada em Stanford CS146S em 8 de outubro de 2026. Quero construir um agente assim em um projeto meu: receber uma tarefa pelo chat, continuar trabalhando quando eu fechar o computador e voltar quando tiver algo importante para dizer.

Os slides trazem os números 2 minutos, 15 segundos, 4.000 caracteres, 100 fatos, 30 eventos, 1280x800 e 100 mil tokens. A regra dos 90% no mesmo padrão de shell, a espera de cerca de 10 minutos e a janela de cache de 10 a 60 minutos também vêm da aula. No plano ao final, a janela de 2 a 3 segundos, a interrupção em menos de 1 segundo e a meta de cache hit acima de 90% são propostas minhas.

## O loop de terminal é o ponto de partida

A aula começa com o loop da semana 1:

```python
messages = [system_prompt, user_message]
while True:
    reply = llm(messages, tools=TOOLS)
    messages.append(reply)
    if not reply.tool_calls:
        print(reply.text); break
    for call in reply.tool_calls:
        messages.append(run_tool(call))
```

O modelo recebe mensagens, pede tools e lê os resultados até terminar. Para trabalhar por meses, esse loop precisa de estado persistente, entradas vindas de outros lugares e uma forma de decidir quando falar.

<div class="overflow-x-auto">
<table>
<thead><tr><th>Comportamento</th><th>Agente de terminal</th><th>Agente sempre ligado</th></tr></thead>
<tbody>
<tr><th scope="row">Execução</th><td>Para quando o laptop fecha.</td><td>Continua no servidor e sobrevive a falhas e deploys.</td></tr>
<tr><th scope="row">Computador</th><td>Usa o seu laptop.</td><td>Tem uma VM na nuvem, com desktop, browser e arquivos.</td></tr>
<tr><th scope="row">Memória</th><td>Lembra da lista de mensagens.</td><td>Salva estado, memória e skills, e resume mensagens antigas.</td></tr>
<tr><th scope="row">Resposta</th><td>Imprime o texto do modelo.</td><td>Envia mensagem por uma tool e pode ficar quieto.</td></tr>
<tr><th scope="row">Início do trabalho</th><td>Espera você digitar.</td><td>Recebe mensagens, agendas e outros eventos.</td></tr>
<tr><th scope="row">Continuidade</th><td>Faz uma tarefa e sai.</td><td>Trabalha por meses, com memória entre conversas.</td></tr>
</tbody>
</table>
</div>

## O loop fica no servidor

A arquitetura tem três partes. Os apps recebem mensagens e mostram progresso. O servidor valida entradas, organiza a fila e executa o loop do agente. A VM executa as tools que precisam de um computador.

O cliente cuida da interface; o servidor concentra o trabalho. O loop fica no servidor, separado tanto do app quanto da VM. Isso permite trocar de dispositivo, continuar com o laptop fechado e deixar trabalhos pesados, como transcrição e imagem, no servidor. Um deploy do loop também não depende da revisão da App Store. Essa separação permite escalar com crescimento rápido. Um agente que trabalha por meses não pode viver no aparelho.

Lee resume a regra de persistência assim:

> "Salve tudo no servidor. A VM sempre pode ser reconstruída."

Se o loop estivesse dentro da VM, reconstruí-la para corrigir uma vulnerabilidade zero-day derrubaria o agente. Com estado salvo no banco e no storage, a máquina pode ser desligada e restaurada quando necessário.

### O que fica ligado

Depois de concluir o turno, o processo para após 2 minutos sem atividade. A VM dorme com um snapshot em disco e só volta quando uma tool precisa dela.

Quando nada acontece, nada roda. Conversas, memória, rotinas e skills estão salvas no servidor; o próximo gatilho traz o agente de volta. Uma rotina que não usa o computador pode terminar sem acordar a VM.

## Cada conversa tem uma fila

Uma mensagem sua é só uma das entradas. O sistema também recebe rotinas, webhooks, menções, DMs e threads no Slack, ligações, reuniões, mensagens de outro agente e avisos de trabalho em background concluído. Check-ins agendados também podem acordá-lo.

O caminho de entrada é este:

1. O roteador descarta duplicatas e escolhe a conversa.
2. A fila da conversa permite um turno por vez.
3. O agente trabalha e decide se tem algo que valha dizer.

Toda ativação registra a origem. O agente consegue distinguir um pedido seu de uma rotina ou de um webhook.

No chat individual, sua mensagem entra na frente e interrompe ou para o turno atual. Grupos, Slack, rotinas e helpers entram no fim da fila. Mensagens rápidas são agrupadas em um lote, e cada lote vira um turno. O agente trabalha um lote por vez. Uma correção como “na verdade, faz na quinta” interrompe o trabalho e continua o mesmo pedido.

## O envio sobrevive a falhas

Quando você aperta enviar, o app mostra a mensagem imediatamente e a salva localmente com um ID único. O servidor descarta IDs que já recebeu. Se o app tentar de novo, a mensagem não entra duplicada.

A mensagem segue para a fila. Durante o turno, o servidor salva cada passo no banco, incluindo a interação com o modelo e as tools.

Para atualizar os dispositivos, o servidor manda um sinal mínimo de que algo mudou. Os apps buscam as mensagens novas no banco. A notificação não carrega os dados da conversa. Se o sinal se perde, as mensagens continuam no banco.

Cada atualização tem um número de sequência. Os apps aplicam as mudanças em ordem e recarregam do banco quando falta uma sequência.

### Qualquer servidor retoma o workflow

Uma fila de jobs comum pode reiniciar um trabalho desde o começo depois de uma falha. O workflow durável registra cada passo, e qualquer servidor retoma do último passo salvo. Os passos precisam ser idempotentes: repetir sua execução deve preservar o resultado esperado.

Na aula, esse motor é o Temporal, open source. O motor cuida dos timers, do cancelamento e dos health checks.

Cada helper também tem seu próprio workflow durável. Se o helper de vídeo cair por falta de memória, ele reinicia sem perder o progresso.

## Os agentes do usuário dividem um computador

O sistema mostrado usa uma microVM Firecracker por usuário. Um supervisor mantém um container Debian rodando dentro dela.

O servidor de arquivos expõe arquivos, conexões de apps e uma visão ao vivo do desktop. O usuário pode assistir ao trabalho e assumir o controle. Um command runner executa shell, manipula arquivos, captura screenshots e faz cliques.

Os agentes do mesmo usuário dividem a máquina, mas cada agente ativo tem uma tela virtual e seu próprio Chrome. Arquivos, ferramentas instaladas e logins do browser persistem entre sessões.

A VM dorme alguns minutos depois da última atividade, nunca no meio de um turno. Antes de parar, sincroniza arquivos com o storage na nuvem e salva memória e disco em snapshot. Na próxima chamada de tool que precisar dela, restaura o snapshot no lugar. Os comandos continuam vindo do servidor.

## O harness controla a interação

O harness é a parte que organiza a interação do modelo com as tools e com o usuário. Na aula, ele controla desde a saída visível até a delegação de trabalho.

### SendToUser é a única saída visível

`SendToUser` é a única ponte de envio para desktop, web, mobile, Slack, email e voz. O texto comum do modelo fica privado; só a chamada dessa tool vira mensagem para o usuário.

Ela suporta texto, arquivos, múltipla escolha e entrada segura de senha. Um cliente novo precisa entender essa saída. A última mensagem também pode encerrar o turno, poupando outra chamada ao modelo.

### A UI acompanha a tool

O cliente intercepta o payload e mostra um controle apropriado à ação. No login mostrado, a integração com 1Password preenche a senha apenas no site aberto, sem entregá-la ao modelo. No pagamento com Stripe Link, a compra espera o usuário permitir ou negar.

Um rascunho de email aparece inteiro, com as opções de enviar ou descartar. Em outros casos, a resposta pode ser uma reação com emoji.

### As definições de tools carregam sob demanda

O prompt leva os nomes das tools. Quando o modelo decide usar uma, carrega a descrição e o schema sob demanda, como um arquivo. Isso deixa mais contexto disponível para a conversa e reduz custo.

A ordem de tentativa vai do recurso mais barato ao mais caro:

1. Contexto e memória que já estão disponíveis.
2. API do app, por conector ou MCP.
3. Busca na web.
4. Browser logado.
5. Desktop inteiro.
6. Perguntar ao usuário.

Cada avanço aumenta tempo, custo e risco. Se um conector quebrar, o agente avisa e pergunta, sem contornar o problema pelo browser.

### Um helper cuida dos cliques

Para páginas web, o agente pode ler a árvore de acessibilidade ou o DOM, identificar botões, links e campos e clicar diretamente. A aula apresenta isso como mais rápido e confiável que trabalhar por screenshot.

Quando precisa interagir com apps de desktop ou diálogos do sistema, usa mouse e teclado por pixels, em uma tela de 1280x800. Login, código de verificação, captcha e pagamento podem exigir uma pessoa. Nesse caso, ele para, explica onde está e entrega a tela.

Quem faz os cliques é um helper separado. Os screenshots ficam com ele, e o principal recebe o que foi encontrado.

### O principal continua disponível

O agente principal responde perguntas rápidas e delega tarefas grandes. Envia ao helper uma descrição completa do pedido e recebe um relatório curto, enquanto continua disponível no chat.

Os helpers cuidam de trabalho geral (shell, web, conectores e cloud agents), uso de browser e desktop e revisão de arquivos de vídeo. O cloud coding agent altera código na mesma VM do usuário. O de computador faz uma tarefa por vez. Uma lista de tarefas acompanha os pedidos; o principal pode checar um helper, mandar uma mensagem ou pará-lo.

O conjunto de tools fica estável entre turnos; indisponibilidade vira erro claro. Descrição e schema de cada tool têm menos de 4.000 caracteres. Salvar estado usa uma tool dedicada, para que a revisão veja a mudança, em vez de tentar entendê-la por comandos de shell.

Se o modelo passa 90% do tempo no mesmo padrão de shell, esse padrão vira uma tool. Os erros devem orientar a próxima ação. O exemplo da aula é:

> "The computer is asleep. Use Shell or Read to wake it, then try again."

## Ações arriscadas passam por revisão

Um modelo separado revisa ações arriscadas antes da execução. Se essa revisão automática bloquear a ação, o usuário recebe um pedido de aprovação. Sem resposta em 15 segundos, ela continua bloqueada.

A origem do texto também importa. O sistema marca conteúdo de email e webhook como não confiável. Memória é informação, não instrução.

O sistema não envia email nem mensagem a terceiros sem um pedido do usuário. Rotinas novas precisam de aprovação. Envios irreversíveis, como email e Slack, passam por rascunho e confirmação de envio.

Senhas ficam em variáveis de ambiente, fora do modelo. Ações no próprio laptop do usuário exigem aprovação.

## O prefixo permanece estável

O prompt é montado em ordem fixa. As definições de tools vêm antes do system prompt, que inclui um snapshot da memória e das rotinas. A primeira mensagem traz o ambiente e os nomes das tools.

Esse começo permanece idêntico até o próximo resumo. O histórico cresce no final; a mensagem nova traz a hora atual, notas curtas sobre mudanças e o pedido do usuário. Na chamada seguinte, o histórico vira parte do prefixo reaproveitável.

Lee trata cache miss como bug. Até testes A/B precisam respeitar a montagem ordenada. Cada seção tem seu hash para localizar mudanças. Se um deploy alterar a descrição de uma tool, uma conversa em andamento recebe uma nota sobre a mudança, preservando o prefixo existente.

Quando o usuário abre o chat ou começa a digitar, o servidor já prepara o prompt e aquece o cache.

<div class="overflow-x-auto">
<table>
<thead><tr><th>Conteúdo pesado</th><th>O que fica no contexto principal</th></tr></thead>
<tbody>
<tr><th scope="row">Saída longa</th><td>O caminho do arquivo que recebeu a saída.</td></tr>
<tr><th scope="row">Trabalho com muitas tools</th><td>Um relatório curto do helper.</td></tr>
<tr><th scope="row">Mensagens antigas</th><td>Um resumo.</td></tr>
<tr><th scope="row">Memórias antigas</th><td>Os fatos mais importantes; o restante fica pesquisável.</td></tr>
<tr><th scope="row">Instruções</th><td>Um ponteiro de uma linha para a skill.</td></tr>
</tbody>
</table>
</div>

Um turno grande termina com mais de 100 mil tokens no prompt. Passam cerca de 10 minutos, e o sistema resume enquanto o cache do provedor ainda está quente, numa janela de 10 a 60 minutos. O resumo é escrito reaproveitando o mesmo prefixo, e a próxima mensagem começa desse resumo curto.

O sistema pula essa compactação quando um trabalho em background já vai acordar o agente. As últimas mensagens enviadas ao usuário são preservadas palavra por palavra. Também é possível resumir no meio de um turno longo demais.

A aula lembra: "Toda compressão perde informação". O algoritmo de resumo é o ponto difícil.

## A memória tem camadas

<div class="overflow-x-auto">
<table>
<thead><tr><th>Camada</th><th>Regra</th></tr></thead>
<tbody>
<tr><th scope="row">Profile</th><td>Fatos centrais sobre o usuário, sempre no prompt: até 100 fatos em 4.000 caracteres.</td></tr>
<tr><th scope="row">Log</th><td>Eventos datados. Os 30 mais relevantes e recentes entram no prompt.</td></tr>
<tr><th scope="row">Notes</th><td>Detalhes de curto prazo, que somem rápido.</td></tr>
<tr><th scope="row">Todo o resto</th><td>Uma tool busca na memória quando necessário.</td></tr>
</tbody>
</table>
</div>

Depois de cada turno, o sistema revisa a memória, adiciona fatos novos e substitui antigos. Só pode remover fatos que recebeu nessa revisão. Os mais importantes ficam acima; os antigos perdem posição aos poucos.

Fatos sobre o usuário são compartilhados entre os agentes dele, e cada agente escreve no próprio arquivo.

Lee chama de "everything is computer" o conhecimento salvo em texto puro. Você e o agente podem ler, buscar e editar esses arquivos. Uma preferência dita uma vez vai para a memória.

```text
memory/
  profile.md        # sempre no prompt
  log/2026-10.md    # fatos datados, um por linha
skills/
  linkedin-sourcing/SKILL.md   # "Use this when..."
  weekly-metrics/SKILL.md
routines/
  morning-brief     # prompt + dias úteis 8:00
```

Skills só carregam quando necessárias; fica um ponteiro de uma linha no prompt. Plugins agrupam skills e servidores MCP. Rotinas são prompts com agenda, no estilo cron. Você mostra uma tarefa no computador do agente, e ele salva os passos como skill.

## Para onde isso vai

Na aula, SFT ensina os formatos e as tools do harness, além de quando responder rápido. Com RL, o modelo aprende a seguir instruções longas, escolher a skill certa entre centenas, clicar no lugar certo e trabalhar com outros agentes. O principal é ajustado para responder em segundos; os helpers, para terminar horas de trabalho com confiabilidade.

O ciclo diário começa com um erro: ele vira uma eval, o harness, o prompt ou a inferência mudam, as evals rodam e a correção é publicada. O próximo modelo é treinado nesse harness e nessas evals.

"Delete the product" é a direção que Lee propõe: construir o mínimo em volta do modelo e remover código conforme ele deixa de ser necessário.

Ainda falta avaliar agentes que trabalham por semanas; substituir memórias antigas, esquecer quando pedirem e nunca inventar lembranças; lidar com prompt injection; e decidir quando falar. Agentes no mesmo computador e na mesma memória trazem problemas clássicos de sistemas distribuídos. Um agente ocioso precisa sair quase de graça.

Os blocos básicos vão além do loop: workflows duráveis, uso de computador, memória e skills, gatilhos e jobs agendados, conectores e autenticação, canais de texto e voz, pagamentos e identidade, evals e observabilidade.

## O que eu faria para replicar

**Esta parte é minha proposta e não está na aula.** Quero começar com um conjunto mínimo que permita testar continuidade, interrupção e memória em um projeto meu.

1. Criaria um servidor com Postgres para conversas, mensagens com sequência e ID único do cliente, eventos com origem e chave de deduplicação, `memory_facts(tier, agent_id, importance, created_at)` e rotinas. As skills poderiam ficar em arquivos versionados.
2. Usaria Temporal, com um workflow por conversa e outro por helper. Cada chamada de tool seria uma activity idempotente. Uma mensagem minha no chat individual cancelaria o turno atual e entraria na frente. As demais entradas usariam uma janela curta, por exemplo 2 a 3 segundos, para agrupar mensagens rápidas em um lote por turno.
3. Montaria o loop com prefixo fixo, hash por seção e `SendToUser` como única saída visível. Uma meta-tool `get_tool(name)` carregaria as definições necessárias, e saídas longas iriam para arquivos.
4. Enviaria notificações com apenas conversa e sequência, usando SSE, websocket ou LISTEN/NOTIFY do Postgres. O cliente buscaria mensagens depois da última sequência recebida e recarregaria se encontrasse um buraco.
5. Começaria o computador com um container Docker Debian por usuário, Chrome com Xvfb, um display por agente, Playwright pela árvore de acessibilidade e noVNC para acompanhar a tela. Evoluiria para Firecracker com snapshot quando o custo de manter máquinas ligadas pesasse.
6. Manteria o profile sempre no prompt, com até 4.000 caracteres, e os 30 itens de log mais relevantes. Usaria notas com TTL e busca full-text ou embeddings para o restante. Um modelo mais barato revisaria a memória depois do turno, propondo adições e substituições e removendo apenas IDs que tivesse visto.
7. Um timer faria a compactação depois de turnos grandes, dentro da janela de cache, preservando as últimas mensagens do agente ao usuário palavra por palavra.
8. Colocaria auto-review antes de shell, envio e pagamento, com bloqueio no timeout. Marcaria entradas externas com `<untrusted source=...>`, guardaria segredos em variáveis de ambiente e exigiria rascunho e confirmação para ações irreversíveis.
9. Cada falha real viraria uma eval desde o início: tool errada, falou quando devia ficar quieto, cache miss ou ignorou a interrupção do usuário.

Eu só aceito a implementação, incluindo a suspensão por snapshot, quando estes resultados aparecerem. São critérios propostos por mim:

- Fechar o cliente durante uma tarefa e reabrir mostra o progresso sem passos repetidos.
- Matar o worker durante um turno permite retomar do último passo.
- Uma correção como “na verdade, faz na quinta” interrompe o turno em menos de 1 segundo.
- Três mensagens rápidas viram um turno só.
- A taxa de cache hit do prefixo supera minha meta de 90% numa conversa longa: um hit é a próxima chamada reaproveitar o prefixo. Os hashes por seção mostram onde ele mudou.
- Um agente ocioso fica sem processo nem VM em execução.
