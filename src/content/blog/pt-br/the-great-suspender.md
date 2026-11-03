---
title: The Great Suspender
date: 2015-06-25
description: Uma dica de 2015 sobre uma extensão do Chrome que depois virou malware. Use a Economia de memória do Chrome.
updated: 2026-11-02
author: Franklin Javier
tags: tooling
lang: pt-br
translationKey: the-great-suspender
---

<aside class="callout" role="note" aria-label="Aviso">

**Atualização, novembro de 2026:** não instale o The Great Suspender. Em 2020 o desenvolvedor original passou a extensão para um dono desconhecido, e em fevereiro de 2021 o Google tirou ela da Chrome Web Store e desativou nos navegadores por ser malware. Hoje o próprio Chrome faz isso: a Economia de memória, em Configurações → Desempenho, descarta as abas inativas. O texto abaixo está como escrevi em 2015.

</aside>

Muitas pessoas vem reclamando do Google Chrome pelo seu consumo de memória. 
Dependendo do uso, o software chega a consumir 1GB. A situação fica ainda pior quando se usa muitas extensões.

Eu tenho o hábito de abrir diversas abas quando estou estudando, 
e no decorrer do dia vou analisando e fechando. Por mais que a config da minha maquina seja boa, 
chega um momento que fica bem lento.

Para tentar amenizar essa situação, [The Great Suspender](https://chrome.google.com/webstore/detail/the-great-suspender/klbibkeccnjlkjkiokjodocebajanakg) 
é uma extensão que suspende o processo das abas que estão inativas por X tempo. 
Ou seja, se eu configurei o tempo para 30 minutos, as abas que ficarem inativas por esse tempo são suspensas. Simples assim!

![Tela de configurações do The Great Suspender: suspender abas após 1 hora, ignorar abas fixadas e abas com formulário não salvo, e um campo de whitelist](/images/blog/the-great-suspender/settings.webp)

As abas "pinadas" ou as definidas em uma whitelist, não entram na condição acima, evitando que páginas 
sejam suspensas.

Outra feature bacana é o histórico de páginas suspensas. Cada entrada inclui um marcador de tempo de quando 
ocorreu a suspensão. Se quiser, você pode voltar a suspender ou recarregar todas as páginas de um dia anterior. 

Achou um jeito melhor de controlar as abas? Me conta no [X](https://x.com/franklinjavier).

Para saber mais:

- [Página do projeto](https://github.com/greatsuspender/thegreatsuspender) (arquivado)
