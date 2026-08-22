---
title: O que performance web realmente significa em e-commerce
date: 2026-08-22
description: Conselho genérico de performance não sobrevive ao contato com uma loja. O que medir, para onde o tempo realmente vai, e por que os maiores ganhos costumam ser remoções.
author: Franklin Javier
tags: performance, frontend, e-commerce, core-web-vitals
lang: pt-br
translationKey: web-performance-ecommerce
---

A maior parte do conteúdo sobre performance é escrita para uma página web genérica. E-commerce não é uma página web genérica. Tem um funil, tem receita atrelada a cada etapa desse funil, e tem uma cauda longa de scripts de terceiros que ninguém do time de engenharia escolheu colocar ali.

Passei anos trabalhando nesse problema em escala, e falei sobre isso publicamente no [Hipsters Ponto Tech #114 e numa palestra sobre performance em e-commerce](/pt-br/speaking/). O que vem a seguir é a parte que o conselho genérico costuma deixar de fora.

## Sua nota no Lighthouse não é a métrica

O erro mais comum de todos é otimizar para o número que aparece no laboratório.

O Lighthouse roda um dispositivo simulado numa rede simulada. É uma ótima ferramenta de depuração e um péssimo alvo. O que importa é dado de campo — o que pessoas reais, em dispositivos reais, efetivamente viveram. Isso significa CrUX, ou melhor ainda, o seu próprio RUM.

A diferença entre os dois raramente é pequena, e quase sempre aponta para o mesmo lado: o campo é pior. Seu time desenvolve em notebooks rápidos com fibra no escritório. Uma fatia relevante do tráfego de e-commerce é Android intermediário em rede móvel, muitas vezes num navegador cheio de extensões e num aparelho que está com throttling térmico desde as 10 da manhã.

Um hábito útil: antes de otimizar qualquer coisa, olhe o p75 do seu dado de campo segmentado por classe de dispositivo. A história que ele conta costuma ser diferente da história do laboratório.

## Ligue cada métrica a uma tela concreta

"Melhorar o LCP" não é uma ação. Melhorar o LCP *onde* é.

**Página de produto.** O LCP é quase sempre a imagem do produto. Ou seja: a correção quase nunca é JavaScript — é o pipeline de imagem. Dimensões corretas, formato moderno, um atributo `sizes` de verdade, `fetchpriority="high"` na imagem principal, e remover o `loading="lazy"` que alguém aplicou em todas as imagens do site, inclusive na que está acima da dobra. Esse último caso é notavelmente comum e custa um round trip inteiro.

**Páginas de listagem.** Aqui quem morde é o CLS, e a causa costuma ser algo injetado tarde: um banner promocional, um selo de desconto, um widget de personalização que decide, depois da hidratação, que o card precisa de mais uma linha de texto. Reserve o espaço antes de saber o conteúdo.

**Carrinho e checkout.** O que dói é o INP. Ele substituiu o FID por um bom motivo — o FID media o atraso até a primeira interação, o que favorecia páginas lentas exatamente nos momentos que importam. As interações que importam numa loja são adicionar ao carrinho, escolher variação, aplicar filtro. São justamente as que rodam mais JavaScript. Uma página pode ter um LCP excelente e ainda assim parecer quebrada porque tocar no seletor de tamanho leva 400ms para pintar.

## A main thread pertence a terceiros

Aqui vai a medição desconfortável: abra uma página de produto real, grave um trace de performance e atribua o tempo de main thread por origem.

Na maioria das lojas, a maior parte não é o seu código. É o gerenciador de tags, o widget de chat, o snippet de teste A/B, o analytics, o motor de recomendação, o pixel de uma campanha que acabou há dois anos.

Isso não é, em primeiro lugar, um problema técnico. É um problema de dono. Esses scripts foram adicionados por pessoas que são avaliadas pelo que o script viabiliza, não pelo que ele custa. Ninguém remove porque ninguém responde pelo agregado.

Duas coisas que funcionam:

- **Um inventário com dono e data de revisão por tag.** Não uma revisão de performance — uma revisão de existência. "Isso ainda faz alguma coisa?" Um número surpreendente não faz.
- **Tirar do caminho crítico e provar que continua funcionando.** Adiar um script de marketing só vira conversa de verdade quando você consegue mostrar para o time de marketing que ele ainda dispara.

## Orçamento precisa de dono, não de dashboard

Orçamentos de performance falham de um jeito previsível: alguém define, o CI começa a avisar, os avisos viram rotina, e seis meses depois o orçamento é decoração.

Um orçamento só funciona quando três coisas são verdade. Ele quebra o CI, não avisa. Ele é por rota, não pelo site inteiro — um limite de bundle para "o app" não diz nada sobre qual página regrediu. E um time específico é dono do número, para que a regressão tenha destinatário.

Sem o terceiro, você tem um dashboard.

## Os maiores ganhos são remoções

Essa é a parte que surpreende quem espera que trabalho de performance seja engenhoso.

Repetidamente, as maiores melhorias vêm de remover, não de otimizar: um bundle de polyfills para navegadores sem tráfego mensurável, uma biblioteca de datas importada inteira por causa de uma chamada de `format`, um conjunto de ícones importado como barrel file, um carrossel na home que o analytics mostra que ninguém passa do primeiro slide, um peso de fonte que o design system não usa.

Tree-shaking não te salva de um barrel import. Code-splitting não te salva de entregar uma funcionalidade que ninguém usa — só faz entregar mais tarde.

Antes de partir para uma otimização engenhosa, faça a auditoria chata: o que tem no bundle, quem colocou, e se ainda existe algo dependendo daquilo. Essa auditoria se pagou todas as vezes em que eu rodei.

## Por onde começar

Se você herdou uma loja lenta e precisa de um ponto de partida:

1. Consiga dado de campo. Sem ele você está adivinhando, e vai otimizar a página errada.
2. Escolha o template de maior receita — normalmente a página de produto — e resolva direito o elemento de LCP dele.
3. Atribua o tempo de main thread por origem e leve esse número para quem é dono das tags.
4. Coloque um orçamento por rota no CI, quebrando o build, com um nome atrelado.
5. Delete alguma coisa.

Nada disso é exótico. A parte difícil nunca foi a técnica — é que performance é um problema entre times sendo resolvido por um time só, e a medição é o que dá alavancagem a esse time.
