---
title: O que performance web realmente significa em e-commerce
date: 2024-03-20
description: Tiramos uma loja de 15s para 3s em 3G lento e a conversão subiu 45%. O que medir, para onde o tempo realmente vai, e por que os maiores ganhos costumam ser remoções.
author: Franklin Javier
tags: performance, frontend, e-commerce, core-web-vitals
lang: pt-br
translationKey: web-performance-ecommerce
---

Na Beleza na Web a gente tirou o carregamento da página de 15 segundos para 3 em 3G lento. A taxa de conversão subiu 45%.

Começo pela metade vergonhosa desse número. Quinze segundos. Era a nossa própria loja, na conexão que boa parte dos nossos clientes tinha de verdade. Levou uns seis meses entre novembro e maio para resolver, e o ganho foi quase todo no navegador. O time to first byte quase não mudou.

É essa a parte que o conselho genérico de performance sempre deixa passar. Uma loja não é uma página web genérica. Ela tem funil, tem dinheiro atrelado a cada etapa desse funil, e tem uma pilha de scripts de terceiros que ninguém da engenharia pediu.

## O seu servidor não é a parte lenta

Tenho um dashboard dessa stack mostrando 51ms no app server e 3,12 segundos de carregamento de página no navegador do usuário final. Mesmo sistema, mesmo minuto. Apdex 0,93 no servidor, 0,69 no navegador.

Dois números, um deles ótimo, e o ótimo mede uma coisa que o cliente nunca vive.

É por isso também que a nota do Lighthouse é o alvo errado. Ele roda um aparelho simulado numa rede simulada. Bom para depurar, ruim como meta. O que importa é dado de campo: o que pessoas reais, em aparelhos reais, pegaram. CrUX, ou melhor ainda, o seu próprio RUM.

Os dois quase nunca batem, e o campo é quase sempre pior. Seu time desenvolve em notebook rápido com fibra no escritório. Boa parte do seu tráfego é um Android intermediário em rede móvel, num navegador cheio de extensão, num aparelho com throttling térmico desde as dez da manhã.

Então, antes de otimizar qualquer coisa, olhe o p75 do seu dado de campo separado por classe de aparelho.

## Toda métrica pertence a uma tela

"Melhorar o LCP" não é tarefa. Melhorar o LCP *onde* é.

Na página de produto, o LCP é a imagem do produto, quase sempre. Então a correção quase nunca é JavaScript. É o pipeline de imagem: dimensão certa, formato moderno, um `sizes` de verdade, `fetchpriority="high"` na imagem principal. E tirar o `loading="lazy"` que alguém aplicou em toda imagem do site, inclusive na que está acima da dobra. Vejo esse aí bastante. Custa um round trip inteiro.

Nas páginas de listagem o problema é CLS, e a causa costuma ser algo que chega tarde: um banner de promoção, um selo de desconto, um widget de personalização que decide depois da hidratação que o card precisa de mais uma linha. Reserve o espaço antes de saber o que vai nele.

No carrinho e no checkout, quem dói é o INP. Ele substituiu o FID por um bom motivo. O FID media só o atraso até a primeira interação, o que favorecia páginas lentas justo na hora que conta. Numa loja, as interações que contam são adicionar ao carrinho, escolher tamanho, aplicar filtro. E são elas que rodam mais JavaScript. Uma página pode ter um LCP ótimo e ainda parecer quebrada porque tocar no tamanho leva 400ms para pintar.

## A maior parte da main thread não é sua

Abra uma página de produto real, grave um trace e agrupe o tempo de main thread por origem.

Na maioria das lojas, o seu código é minoria. O resto é o gerenciador de tags, o widget de chat, o snippet de teste A/B, o analytics, um motor de recomendação, um pixel de campanha que acabou faz dois anos.

O que faz disso um problema de dono, mais do que um problema técnico. Esses scripts foram colocados por gente que é avaliada pelo que o script viabiliza, nunca pelo que ele custa. Ninguém remove porque ninguém responde pelo total.

Duas coisas que funcionam:

- **Um inventário com dono e data de revisão por tag.** Não uma revisão de performance. Uma revisão de existência: isso ainda faz alguma coisa? Boa parte não faz.
- **Tirar do caminho crítico e provar que continua disparando.** Adiar um script de marketing só vira conversa de verdade quando você mostra para o marketing que ele ainda funciona.

## Orçamento sem dono é dashboard

Orçamento de performance morre sempre do mesmo jeito. Alguém define, o CI começa a avisar, os avisos viram papel de parede, e seis meses depois o orçamento é enfeite.

Orçamento funciona quando quebra o build em vez de avisar. Quando é por rota, porque um limite de bundle para "o app" não diz nada sobre qual página regrediu. E quando um time específico é dono do número, para a regressão ter em quem bater.

## Delete coisas

As maiores melhorias quase sempre vêm de remover, não de otimizar. Um bundle de polyfill para navegador sem tráfego mensurável. Uma biblioteca de data importada inteira por causa de um `format`. Um pacote de ícones importado como barrel file. Um carrossel na home que o analytics diz que ninguém passa do primeiro slide. Um peso de fonte que o design system nunca usa.

Tree-shaking não te salva de um barrel import. Code-splitting não te salva de uma funcionalidade que ninguém usa; só entrega ela mais tarde.

Então, antes da otimização esperta, faça a auditoria chata: o que tem no bundle, quem colocou, se ainda tem algo dependendo daquilo. Essa auditoria se pagou todas as vezes que eu rodei.

## A stack é pública

O boilerplate que a gente padronizou está em [github.com/franklinjavier/storefront](https://github.com/franklinjavier/storefront). Node.js, Redis, views renderizadas no servidor, New Relic plugado. Ele ainda roda as lojas da Beleza na Web e do Grupo Boticário hoje.

O README diz que ele escala além de 1M de throughput. É o mesmo dashboard: 472 mil requisições por minuto na média, com pico de 1,1 milhão, e taxa de erro de 0,0064%.

## Por onde começar

Você herdou uma loja lenta e precisa de um ponto de partida:

1. Consiga dado de campo. Sem ele você está adivinhando, e vai otimizar a página errada.
2. Pegue o template de maior receita, normalmente a página de produto, e resolva direito o elemento de LCP dele.
3. Agrupe o tempo de main thread por origem e leve esse número para quem é dono das tags.
4. Coloque um orçamento por rota no CI, quebrando o build, com nome de time nele.
5. Delete alguma coisa.

Nada disso é esperto. Performance é um problema que atravessa times e cai no colo de um só, e medição é como esse time faz os outros se mexerem. O 45% foi o que fez todo mundo se importar.
