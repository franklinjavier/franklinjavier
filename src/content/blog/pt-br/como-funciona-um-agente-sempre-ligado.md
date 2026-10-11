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

Lee mostra como salvar cada passo, interromper trabalho em andamento e manter memória entre conversas. Os números citados aqui, como 2 minutos, 15 segundos, 4.000 caracteres, 100 fatos, 30 eventos, 1280x800 e 100 mil tokens, aparecem nos slides da aula.

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
<tr><th scope="row">Execução</th><td>Para quando o laptop fecha.</td><td>Continua no servidor, atravessando falhas e deploys.</td></tr>
<tr><th scope="row">Computador</th><td>Usa o seu laptop.</td><td>Tem uma VM na nuvem, com desktop, browser e arquivos.</td></tr>
<tr><th scope="row">Memória</th><td>Lembra da lista de mensagens.</td><td>Salva estado, memória e skills, e resume mensagens antigas.</td></tr>
<tr><th scope="row">Resposta</th><td>Imprime o texto do modelo.</td><td>Envia mensagem por uma tool e pode ficar quieto.</td></tr>
<tr><th scope="row">Início do trabalho</th><td>Espera você digitar.</td><td>Recebe mensagens, agendas e outros eventos.</td></tr>
<tr><th scope="row">Continuidade</th><td>Faz uma tarefa e sai.</td><td>Trabalha por meses, com memória entre conversas.</td></tr>
</tbody>
</table>
</div>

## Separar cliente, servidor e computador do agente

A arquitetura tem três partes. Os apps recebem mensagens e mostram progresso. O servidor valida entradas, organiza a fila e executa o loop do agente. A VM executa as tools que precisam de um computador.

É a regra de **cliente fino, servidor grosso**. O loop fica no servidor, separado tanto do app quanto da VM. Isso permite trocar de dispositivo, continuar com o laptop fechado e deixar trabalhos pesados, como transcrição e imagem, no servidor. Um deploy do loop também não depende da revisão de uma loja de aplicativos.

Lee resume a regra de persistência assim:

> "Salve tudo no servidor. A VM sempre pode ser reconstruída."

Se o loop estivesse dentro da VM, reconstruí-la para aplicar um patch de segurança derrubaria o agente. Com estado salvo no banco e no storage, a máquina pode ser desligada e restaurada quando necessário.

### O que fica ligado

O processo executa um turno e para; o prazo de ociosidade mostrado é de 2 minutos. A VM dorme com um snapshot em disco e só volta quando uma tool precisa dela.

Conversas, memória, rotinas e skills permanecem no servidor. Um gatilho carrega esse estado e inicia o trabalho. Uma rotina que não usa o computador pode terminar sem acordar a VM.

## Receber eventos e decidir a prioridade

Uma mensagem sua é só uma das entradas. O sistema também recebe rotinas, webhooks, menções e threads no Slack, ligações, reuniões, mensagens de outro agente e avisos de trabalho em background concluído. Check-ins agendados também podem acordá-lo.

O caminho de entrada é este:

1. O roteador descarta duplicatas e escolhe a conversa.
2. A fila da conversa permite um turno por vez.
3. O agente trabalha e decide se tem algo que justifique uma mensagem.

Toda ativação registra a origem. O agente consegue distinguir um pedido seu de uma rotina ou de um webhook.

No chat individual, sua mensagem entra na frente e pode interromper ou parar o turno atual. Grupos, Slack, rotinas e helpers entram no fim da fila. Mensagens rápidas são agrupadas em um lote, e cada lote vira um turno.

## Fazer o envio sobreviver a falhas

Quando você aperta enviar, o app mostra a mensagem imediatamente e a salva localmente com um ID único. O servidor descarta IDs que já recebeu. Se o app tentar de novo, a mensagem não entra duplicada.

A mensagem segue para a fila. Durante o turno, o servidor salva cada passo no banco, incluindo a interação com o modelo e as tools.

Para atualizar os dispositivos, o servidor manda um sinal mínimo de que algo mudou. Os apps buscam as mensagens novas no banco. A notificação não carrega os dados da conversa, então perder esse sinal não significa perder o conteúdo salvo.

Cada atualização tem um número de sequência. Os apps aplicam as mudanças em ordem e recarregam do banco quando falta uma sequência.

### Retomar com workflows duráveis

Uma fila de jobs comum pode reiniciar um trabalho desde o começo depois de uma falha. O workflow durável registra os passos e retoma de onde parou, sem refazer o que já concluiu.

Na aula, esse motor é o Temporal, open source. Cada passo precisa ser idempotente: repetir sua execução deve preservar o resultado esperado. Timers, cancelamento e verificações de saúde ficam a cargo do motor.

Cada helper também tem seu próprio workflow durável. Se o helper de vídeo cair por falta de memória, ele reinicia sem perder o progresso.

## Dar um computador ao agente

O sistema mostrado usa uma microVM Firecracker por usuário. Dentro dela, um container Debian fica sob responsabilidade de um supervisor.

O servidor de arquivos oferece acesso aos arquivos, às conexões de apps e à visão ao vivo do desktop. O usuário pode assistir ao trabalho e assumir o controle. Um command runner executa shell, manipula arquivos, captura screenshots e faz cliques.

Os agentes do mesmo usuário dividem a máquina, mas cada agente ativo tem uma tela virtual e seu próprio Chrome. Arquivos, ferramentas instaladas e logins do browser persistem entre sessões.

A VM dorme alguns minutos depois da última atividade, nunca no meio de um turno. Antes de parar, sincroniza arquivos com o storage na nuvem e salva memória e disco em snapshot. Na próxima chamada de tool que precisar dela, restaura o snapshot no lugar. Os comandos continuam vindo do servidor.

## Construir o harness

O harness é a parte que organiza a interação do modelo com as tools e com o usuário. Na aula, ele controla desde a saída visível até a delegação de trabalho.

### Falar só por SendToUser

`SendToUser` é a única ponte de envio entre servidor e cliente. O texto comum do modelo fica privado; só a chamada dessa tool vira mensagem para o usuário.

Ela suporta texto, arquivos, múltipla escolha e entrada segura de senha. Um cliente novo precisa entender essa saída. A última mensagem também pode encerrar o turno, poupando outra chamada ao modelo.

### A UI acompanha a tool

O cliente intercepta o payload e mostra um controle apropriado à ação. No login mostrado, a integração com 1Password preenche a senha apenas no site aberto, sem entregá-la ao modelo. No pagamento com Stripe Link, a compra espera o usuário permitir ou negar.

Um rascunho de email aparece inteiro, com as opções de enviar ou descartar. Em outros casos, a resposta pode ser uma reação com emoji.

### Descobrir tools quando precisar

O prompt leva os nomes das tools. Quando o modelo decide usar uma, carrega a descrição e o schema sob demanda, como um arquivo. Isso deixa mais contexto disponível para a conversa e reduz custo.

A ordem de tentativa vai do recurso mais barato ao mais caro:

1. Contexto e memória que já estão disponíveis.
2. API do app, por conector ou MCP.
3. Busca na web.
4. Browser logado.
5. Desktop inteiro.
6. Perguntar ao usuário.

Cada avanço aumenta tempo, custo e risco. Se um conector quebrar, o agente avisa e pergunta, sem contornar o problema pelo browser.

### Usar o computador sem lotar o contexto

Para páginas web, o agente pode ler a árvore de acessibilidade ou o DOM, identificar campos e botões e clicar diretamente. A aula apresenta isso como mais rápido e confiável que trabalhar por screenshot.

Quando precisa interagir com apps de desktop ou diálogos do sistema, usa mouse e teclado por pixels, em uma tela de 1280x800. Login, código de verificação, captcha e pagamento podem exigir uma pessoa. Nesse caso, ele para, explica onde está e entrega a tela.

Quem faz os cliques é um helper separado. Os screenshots ficam com ele, e o principal recebe o que foi encontrado.

### Manter o principal disponível

O agente principal responde perguntas rápidas e delega tarefas grandes. Envia ao helper uma descrição completa do pedido e recebe um relatório curto, enquanto continua disponível no chat.

Há helpers para trabalho geral, uso de computador, vídeo e mudanças de código na própria VM. O de computador faz uma tarefa por vez. Uma lista de tarefas acompanha os pedidos; o principal pode checar um helper, mandar uma mensagem ou pará-lo.

As tools também seguem regras de projeto. O conjunto fica estável entre turnos; indisponibilidade vira erro claro. Descrição e schema de cada tool têm menos de 4.000 caracteres. Salvar estado usa uma tool dedicada, para que a revisão veja a mudança, em vez de tentar entendê-la por comandos de shell.

Padrões repetidos de shell podem virar tools. Os erros devem orientar a próxima ação. O exemplo da aula é:

> "The computer is asleep. Use Shell or Read to wake it, then try again."

## Definir limites para a autonomia

Um modelo separado revisa ações arriscadas antes da execução. Se essa revisão automática bloquear a ação, o usuário recebe um pedido de aprovação. Sem resposta em 15 segundos, ela continua bloqueada.

A origem do texto também importa. Conteúdo de email e webhook recebe marcação de entrada não confiável. Memória é informação, não instrução: um fato salvo não ganha autoridade para mandar o agente agir.

O sistema não envia email nem mensagem a terceiros sem um pedido do usuário. Rotinas novas precisam de aprovação. Envios irreversíveis, como email e Slack, passam por rascunho e confirmação de envio.

Senhas ficam em variáveis de ambiente, fora do modelo. Ações no próprio laptop do usuário exigem aprovação.

## Manter o contexto pequeno e reaproveitar o prefixo

O prompt é montado em ordem fixa. As definições de tools vêm antes do system prompt, que inclui um snapshot da memória e das rotinas. A primeira mensagem traz o ambiente e os nomes das tools.

Esse começo permanece idêntico até o próximo resumo. O histórico cresce no final; a mensagem nova traz a hora atual, notas curtas sobre mudanças e o pedido do usuário. O prefixo pode ser reaproveitado pelo cache.

Lee trata cache miss como bug. Até testes A/B precisam respeitar a montagem ordenada. Cada seção tem seu hash para localizar mudanças. Se um deploy alterar a descrição de uma tool, uma conversa em andamento recebe uma nota sobre a mudança, preservando o prefixo existente.

Quando o usuário abre o chat ou começa a digitar, o servidor já prepara o prompt e aquece o cache.

<div class="overflow-x-auto">
<table>
<thead><tr><th>Conteúdo pesado</th><th>O que fica no contexto principal</th></tr></thead>
<tbody>
<tr><th scope="row">Saída longa</th><td>O caminho do arquivo que recebeu a saída.</td></tr>
<tr><th scope="row">Screenshots</th><td>O que o helper encontrou.</td></tr>
<tr><th scope="row">Trabalho com muitas tools</th><td>Um relatório curto do helper.</td></tr>
<tr><th scope="row">Mensagens antigas</th><td>Um resumo.</td></tr>
<tr><th scope="row">Memórias antigas</th><td>Os fatos mais importantes; o restante fica pesquisável.</td></tr>
<tr><th scope="row">Instruções</th><td>Um ponteiro de uma linha para a skill.</td></tr>
</tbody>
</table>
</div>

Um turno grande pode terminar com mais de 100 mil tokens no prompt. A aula descreve esperar cerca de 10 minutos e resumir enquanto o cache do provedor ainda está quente, numa janela de 10 a 60 minutos. O resumo reaproveita o prefixo, e a próxima mensagem começa com contexto menor.

Essa compactação é pulada se um trabalho em background já estiver para acordar o agente. As últimas mensagens enviadas ao usuário são preservadas palavra por palavra. Também é possível resumir no meio de um turno longo demais.

Lee ressalva: "Toda compressão perde informação". Escolher o que preservar no resumo continua sendo a parte difícil.

## Guardar memória em camadas

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

Depois de cada turno, uma passada adiciona fatos novos e substitui antigos. Ela só pode remover fatos que foram mostrados a ela. Os mais importantes ficam acima; os antigos perdem posição aos poucos.

Fatos sobre o usuário são compartilhados entre os agentes dele, e cada agente escreve no próprio arquivo. O modelo recebe o aviso de que essa memória deve ser lida como informação.

O conhecimento também fica em arquivos de texto. Skills só carregam quando necessárias, e rotinas são prompts com agenda, no estilo cron. O usuário e o agente podem ler, buscar e editar esse conteúdo. Ao observar alguém executar uma tarefa no computador, o agente pode salvar os passos como skill.

## O que ainda precisa melhorar

A aula também aborda treinar modelos para o harness. SFT ensina tools e formatos; RL trabalha seguimento de instruções longas, escolha de skills, cliques e colaboração entre agentes. O principal é ajustado para responder em segundos, enquanto helpers são ajustados para concluir horas de trabalho.

Os erros alimentam evals e correções no harness, no prompt ou na inferência. Continuam em aberto a avaliação de agentes que trabalham por semanas, a memória correta, prompt injection, quando falar, coordenação entre agentes e custo durante a ociosidade.

## O que eu faria para replicar

**Esta parte é minha proposta e não está na aula.** Quero começar com um conjunto mínimo que permita testar continuidade, interrupção e memória em um projeto meu.

1. Criaria um servidor com Postgres para conversas, mensagens com sequência e ID único do cliente, eventos com origem e chave de deduplicação, memória e rotinas. As skills poderiam ficar em arquivos versionados.
2. Usaria Temporal, com um workflow por conversa e outro por helper. Cada chamada de tool seria uma activity idempotente. A fila agruparia mensagens rápidas numa janela de 2 a 3 segundos; mensagens minhas no chat individual cancelariam o turno atual e entrariam na frente.
3. Montaria o loop com prefixo fixo, hash por seção e `SendToUser` como única saída visível. Uma meta-tool `get_tool(name)` carregaria as definições necessárias, e saídas longas iriam para arquivos.
4. Enviaria notificações com apenas conversa e sequência, usando SSE, websocket ou LISTEN/NOTIFY do Postgres. O cliente buscaria mensagens depois da última sequência recebida e recarregaria se encontrasse um buraco.
5. Começaria o computador com um container Docker Debian por usuário, Chrome com Xvfb, um display por agente, Playwright pela árvore de acessibilidade e noVNC para acompanhar a tela. Evoluiria para Firecracker com snapshot quando o custo de manter máquinas ligadas pesasse.
6. Implementaria profile, log, notas com TTL e busca no restante da memória. A passada pós-turno proporia adições e substituições, removendo apenas IDs que tivesse visto. Um timer faria a compactação dentro da janela de cache, preservando as últimas mensagens literais.
7. Colocaria auto-review antes de shell, envio e pagamento, com bloqueio no timeout. Marcaria entradas externas como não confiáveis e manteria rascunho e confirmação para ações irreversíveis. Cada falha real viraria uma eval desde o início.

Para aceitar a implementação, incluindo a suspensão por snapshot, eu exigiria estes resultados. São critérios propostos por mim:

- Fechar o cliente durante uma tarefa e reabrir mostra o progresso sem passos repetidos.
- Matar o worker durante um turno permite retomar do último passo.
- Uma correção minha interrompe o turno em menos de 1 segundo.
- Três mensagens rápidas viram um turno só.
- O cache do prefixo fica acima de 90% numa conversa longa, com hashes para acompanhar sua estabilidade.
- Um agente ocioso fica sem processo nem VM em execução.
