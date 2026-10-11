---
title: Como funciona um agente em loop
date: 2026-10-11
description: Laptop fechado, mensagens chegando juntas, servidor caindo e contexto caro. As soluções da aula de Lee Robinson para um agente sempre ligado e o que eu construiria primeiro.
author: Franklin Javier
tags: ia, agentes, arquitetura, llm
lang: pt-br
translationKey: always-on-agents
series: { key: agent-experiments, part: 2 }
toc:
  por-que-o-agente-não-roda-na-máquina-que-você-fecha: Máquina sempre ligada
  a-máquina-precisa-poder-ser-reconstruída: Máquina reconstruível
  mensagens-rápidas-precisam-virar-um-pedido-só: Fila de mensagens
  como-retomar-sem-repetir-um-pagamento: Retomada sem duplicação
  trocar-de-aparelho-não-pode-duplicar-a-conversa: Conversa entre aparelhos
  ferramentas-demais-ocupam-o-espaço-da-tarefa: Ferramentas sob demanda
  o-agente-precisa-saber-ficar-quieto: Saída ao usuário
  delegar-mantém-a-conversa-disponível: Delegação de tarefas
  cache-o-detalhe-que-define-o-custo: Cache do prompt
  memória-útil-precisa-caber-no-prompt: Memória em camadas
  um-email-recebido-não-pode-autorizar-uma-ação: Autorização de ações
  minha-proposta-o-que-eu-construiria-primeiro: Por onde começar
---

No [post anterior](/pt-br/blog/macbook-velho-virou-servidor-de-contexto/), contei como meu MacBook velho virou o servidor que guarda o contexto dos meus agentes. Com essa metade funcionando, quero experimentar a outra: o que faz um agente continuar trabalhando por conta própria ali, depois que eu saio? A aula [How always-on agents work, de Lee Robinson (@leerob)](https://x.com/leerob/status/2108650243365736855), apresentada em Stanford CS146S em 8 de outubro de 2026, dá uma base para esse próximo passo.

Meu outro Mac já dormiu no meio de uma tarefa. Do celular, pedi ao agente no servidor para descobrir onde ela tinha parado. Ele encontrou o histórico na memória compartilhada e conferiu no GitHub o que já tinha sido enviado.

No [vídeo](https://x.com/leerob/status/2108650243365736855): 2:35 (como chegamos aqui); 6:13 (modelos); 10:06 (arquitetura); 18:07 (harness); 27:26 (contexto); 34:26 (próximos passos).

A arquitetura vem da aula. Os relatos do MacBook vêm das experiências que contei no post anterior; os outros exemplos são hipotéticos. O plano final é uma proposta minha.

## Por que o agente não roda na máquina que você fecha

Se a tarefa depende do processo aberto no terminal, suspender o computador interrompe o trabalho. Meu MacBook resolve essa parte porque funciona como servidor em vez de laptop: fica de tampa fechada, na tomada, ligado o dia inteiro, com o modo de suspensão desativado. A aula começa pelo loop da semana 1:

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

O modelo pede ferramentas, recebe os resultados e decide o próximo passo. Para continuar depois que você sai, esse loop roda no servidor, que salva cada passo. O aplicativo recebe mensagens e mostra o progresso. A VM, o computador do agente na nuvem, executa as ferramentas que precisam de uma máquina. Lee explica essa divisão [no vídeo](https://x.com/leerob/status/2108650243365736855) (a partir de 10:06).

<figure data-diagram="architecture"></figure>

Sempre ligado também permite parar quando não há trabalho. O processo encerra após 2 minutos ocioso; um novo evento carrega o estado e inicia outro turno. Os números usados neste texto vêm dos slides da aula.

Imagine pedir uma pesquisa antes de dormir. Você fecha o laptop, mas o servidor continua a tarefa. De manhã, abre a conversa no celular e encontra o progresso salvo, sem precisar manter o terminal aberto durante a noite.

## A máquina precisa poder ser reconstruída

Um patch de segurança pode exigir reconstruir a VM. Se a conversa e o progresso existirem só nela, a manutenção vira perda de trabalho. A orientação da aula é direta: “Salve tudo no servidor. A VM sempre pode ser reconstruída.”

O servidor guarda conversas, memória, rotinas e skills. Cada usuário tem uma microVM Firecracker com Linux e navegador. Seus agentes dividem a máquina, cada um com sua tela virtual e seu Chrome.

Quando fica ociosa, a VM sincroniza os arquivos com o armazenamento na nuvem, salva um snapshot da memória e do disco e para. Nunca dorme no meio de um turno. Uma chamada de ferramenta que precise dela restaura o snapshot, incluindo ferramentas instaladas e sessões do navegador.

<figure data-diagram="lifecycle"></figure>

Suponha que o agente tenha preparado uma planilha e a máquina durma. Ao pedir uma alteração, você provoca uma nova chamada de ferramenta. A VM acorda com os arquivos e o navegador preservados; o servidor mantém a conversa.

## Mensagens rápidas precisam virar um pedido só

Executar cada mensagem separadamente cria concorrência sobre o mesmo pedido. O agente pode agir antes de receber a correção seguinte.

Na aula, um roteador elimina eventos duplicados e escolhe a conversa. Cada conversa tem sua fila e executa um turno por vez. Mensagens rápidas entram em lote. Eventos de Slack, grupos, rotinas e helpers aguardam na fila, mas uma mensagem sua no chat individual pode interromper ou parar o turno atual.

<figure data-diagram="wakeups"></figure>

Imagine um pedido pelo Slack: incluir alguém numa reunião, depois acrescentar outra pessoa e, por último, agradecer. Essas mensagens podem virar um único turno. Se você mudar o dia pelo chat individual, com “na verdade, faz na quinta”, a correção entra na frente e redireciona o trabalho em andamento.

## Como retomar sem repetir um pagamento

Reiniciar um job do começo depois de uma queda pode repetir uma ação já concluída. No MacBook, testei reiniciar a máquina e derrubar o Wi-Fi; os serviços voltaram sozinhos. Retomar cada etapa de uma tarefa é o teste que quero fazer agora. Em um pagamento, repetir uma etapa pode significar outra cobrança.

A aula usa Temporal para executar workflows duráveis: sequências de trabalho com cada passo registrado. Outro servidor consegue retomar do último passo salvo. As etapas também precisam ser idempotentes, isto é, uma repetição deve manter o mesmo resultado, sem criar outra ação. O motor oferece timers, cancelamento e verificações de saúde (health checks); cada helper tem seu próprio workflow.

<figure data-diagram="durable"></figure>

Num cenário hipotético, uma compra já autorizada é concluída e o servidor cai antes de salvar o resultado. Ao retomar, o passo de pagamento pode ser tentado novamente. A idempotência precisa reconhecer aquela mesma operação e impedir outra cobrança.

## Trocar de aparelho não pode duplicar a conversa

Uma conexão instável pode fazer o aplicativo reenviar a mensagem. Ao mesmo tempo, o celular e o computador precisam mostrar a mesma conversa.

O cliente exibe a mensagem e a salva localmente com um identificador único. O servidor ignora identificadores já recebidos. Outros aplicativos recebem um aviso de mudança e buscam os dados no banco. Os updates têm uma sequência; uma lacuna faz o cliente recarregar os dados.

Imagine enviar um pedido no celular e perder a conexão antes da confirmação. O aplicativo tenta de novo com o mesmo identificador, sem criar outro pedido. Quando você abre o computador, ele busca a conversa salva. Perder um aviso de atualização não apaga a mensagem.

## Ferramentas demais ocupam o espaço da tarefa

Carregar a definição completa de toda ferramenta deixa menos contexto para entender o pedido. Muitas dessas ferramentas nem serão usadas naquele turno.

A solução da aula é levar só os nomes no prompt e carregar descrição e schema sob demanda. Essa parte do harness aparece [no vídeo](https://x.com/leerob/status/2108650243365736855) (a partir de 18:07). Cada definição fica abaixo de 4.000 caracteres. O conjunto permanece estável: uma ferramenta indisponível devolve um erro claro, em vez de desaparecer. Salvar estado merece uma ferramenta própria; se o modelo passa 90% do tempo repetindo um padrão de shell, esse padrão deve virar ferramenta.

A escolha também segue uma ordem de custo crescente: contexto e memória, API do aplicativo, busca na web, navegador logado, desktop e pergunta ao usuário. Um conector quebrado exige avisar e perguntar, sem contornar a falha pelo navegador.

<figure data-diagram="ladder"></figure>

Suponha que você peça os compromissos de amanhã. O agente carrega a ferramenta de calendário e consulta a API. Se o conector falhar, informa o problema e pede orientação. Ele não abre o navegador por conta própria para tentar recuperar acesso.

## O agente precisa saber ficar quieto

Exibir toda resposta do modelo enche o chat de comentários sobre cada tentativa e texto privado. Alguns eventos nem trazem algo útil para dizer.

No harness da aula, o código que organiza o uso do modelo e das ferramentas, `SendToUser` é a única saída visível. Texto comum e raciocínio ficam privados. O agente pode terminar um turno em silêncio. Quando precisa falar, a ferramenta envia texto, arquivos ou controles para uma decisão; a última mensagem pode encerrar o turno sem outra chamada ao modelo.

No meu servidor, o monitoramento já só me avisa no Telegram quando algo muda. Desliguei o Wi-Fi para testar, e o alerta chegou. Para o loop, quero testar esse mesmo critério: uma rotina autorizada que verifica um documento termina em silêncio se ele continuar igual e avisa quando houver uma mudança relevante.

## Delegar mantém a conversa disponível

Uma tarefa longa pode ocupar o agente principal e encher o contexto com screenshots. Você ainda precisa conseguir corrigir o pedido.

Lee separa o principal dos helpers. O principal entrega uma descrição completa da tarefa e recebe um relatório curto. Uma lista acompanha os pedidos, e ele pode consultar, orientar ou parar um helper. Cada helper executa seu próprio workflow durável.

No meu time de agentes, um orquestrador classifica o pedido e o encaminha ao bot fixo daquele projeto. Esse bot planeja o trabalho, fica responsável pelo PR e me devolve o resultado. Na aula, o agente principal passa uma tarefa a um helper e recebe um relatório de volta; no meu time, o bot continua com o projeto e mantém o contexto dele entre tarefas. Quando peço para corrigir um bug no site, por exemplo, o orquestrador passa o pedido ao bot do site, que já conhece o repositório.

<figure data-diagram="helpers"></figure>

O helper de computador concentra os cliques e screenshots. Na web, pode ler a estrutura da página; para ações em pixels, a aula usa uma tela de 1280x800. Quando precisa de intervenção humana, entrega o controle. Já o cloud coding agent faz mudanças de código **numa VM só dele, separada da VM do usuário**.

Imagine pedir a revisão de um vídeo e depois perguntar sobre o prazo de outra tarefa. O helper cuida do vídeo, enquanto o principal continua disponível no chat. Ao terminar, devolve um relatório curto, sem colocar todo o material analisado na conversa principal.

## Cache: o detalhe que define o custo

Mudanças pequenas no prompt podem impedir o uso do cache e aumentar o custo. Até alterar a ordem das ferramentas pode ter esse efeito. A engenharia de contexto começa [no vídeo](https://x.com/leerob/status/2108650243365736855) (a partir de 27:26).

Na aula, o prefixo do prompt segue uma ordem fixa e fica idêntico até o próximo resumo. O histórico cresce no final. Horário e notas sobre mudanças entram na mensagem nova. Se um deploy altera a descrição de uma ferramenta, a conversa em andamento recebe uma nota, sem substituir o texto antigo. Hashes por seção ajudam a localizar mudanças; Lee trata cache miss como bug.

<figure data-diagram="prompt-cache"></figure>

A compactação aproveita essa estabilidade. No caso apresentado, o sistema espera cerca de 10 minutos depois de um turno que termina com o prompt acima de 100 mil tokens e resume enquanto o cache ainda está quente, numa janela de 10 a 60 minutos. Preserva as últimas mensagens ao usuário palavra por palavra. Se um trabalho em background estiver prestes a acordar o agente, pula essa compactação.

Suponha que uma pesquisa longa termine e você saia do chat. O sistema pode resumir durante a pausa usando o prefixo em cache. Seu próximo pedido começa com o resumo menor. Há perda de informação na compressão, então a qualidade desse resumo continua sendo um problema a resolver.

## Memória útil precisa caber no prompt

Guardar tudo não garante encontrar uma preferência quando ela importa. No servidor, instruo os agentes a tratar a memória como histórico e conferir o estado atual no repositório e no histórico de alterações. Foi assim que o agente conferiu o trabalho do meu outro Mac. Carregar tudo no prompt também consome o espaço da tarefa atual.

A aula divide a memória em camadas. O perfil, sempre no prompt, comporta até 100 fatos em 4.000 caracteres. O log traz eventos datados, com os 30 mais relevantes e recentes no contexto. Notas guardam detalhes de curto prazo; o restante fica disponível por busca.

Depois de cada turno, uma revisão adiciona fatos e substitui informações antigas. Ela só pode remover fatos que recebeu para examinar. A memória entra como informação, nunca como instrução com autoridade para comandar ações.

Imagine dizer que prefere reuniões à tarde. Essa preferência vai para o perfil e acompanha os próximos pedidos. Quando você precisar recuperar o motivo de uma reunião antiga, o agente busca o histórico específico, sem carregar todas as conversas para sugerir um horário.

## Um email recebido não pode autorizar uma ação

Um email de phishing pode mandar o agente enviar dinheiro e se apresentar como uma instrução urgente. Já limito as permissões dos meus agentes ao que cada um precisa. O loop também precisa preservar a origem do texto para não confundir conteúdo recebido com um pedido meu.

A aula marca textos de email e webhook como não confiáveis. Antes de uma ação arriscada, outro modelo faz o auto-review. Se o modelo bloquear a ação, o usuário recebe um pedido de aprovação. Se o usuário não responder em 15 segundos, a ação continua bloqueada.

Envios irreversíveis passam por rascunho e confirmação. O agente não manda mensagens a outras pessoas sem você pedir, e rotinas novas precisam do seu OK. Segredos ficam em variáveis de ambiente, fora do modelo.

Suponha que um email peça uma transferência para uma conta nova. O agente deve tratar a solicitação como conteúdo externo, sem tomá-la como autorização sua. Qualquer tentativa de ação arriscada passa pela revisão. Se o modelo bloquear a ação, você recebe um pedido de aprovação; sem resposta sua em 15 segundos, ela continua bloqueada. Se você pedir uma resposta por email, verá o rascunho antes de enviar.

## Minha proposta: o que eu construiria primeiro

Na parte final da [aula](https://x.com/leerob/status/2108650243365736855) (a partir de 34:26), Lee propõe “Delete the product”: construir o mínimo em volta do modelo e remover o que ele não precisa mais.

Este plano é meu, separado da aula do Lee. Eu começaria pela continuidade: uma tarefa interrompida obriga o usuário a descobrir o que já foi feito.

1. Colocar o loop no servidor e salvar conversas e progresso em Postgres. Os aplicativos buscariam o estado salvo quando recebessem um aviso de atualização.
2. Usar Temporal para retomar tarefas, com etapas idempotentes. Organizar a fila por conversa, agrupar mensagens rápidas e dar prioridade às correções no chat individual.
3. Limitar a saída visível a `SendToUser`. Carregar ferramentas conforme a necessidade e manter o prefixo estável, com memória curta e busca para detalhes antigos.
4. Começar o computador do agente com um container isolado por usuário. Adicionar helpers às tarefas longas e evoluir para snapshots quando o custo das máquinas ociosas pesar.
5. Colocar revisão automática antes das ações arriscadas e confirmação nos envios irreversíveis. Transformar cada falha real em um teste que ajude a corrigir o comportamento.

Meu primeiro cenário seria uma pesquisa que continua com o laptop fechado e aceita uma correção pelo celular. Depois eu ampliaria o acesso do agente a ações com consequências externas.

Agora tenho critérios para avaliar se uma tarefa pode continuar depois que eu saio da conversa. Ainda quero testar a retomada no ponto certo e entender como os agentes vão coordenar o trabalho entre si. No próximo capítulo, vou tratar da oficina de agentes, onde pretendo colocar vários deles rodando em loops juntos.
