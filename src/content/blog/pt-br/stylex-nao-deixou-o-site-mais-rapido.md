---
title: Troquei Tailwind por StyleX. O site não ficou mais rápido
date: 2026-08-25
description: Rodei no franklinjavier.com o mesmo tipo de troca que o Aiden Bai publicou. Com o visual igual, o LCP não se moveu. O CSS que caiu de verdade era typography que a home nunca pedia, e isso também roda no Tailwind.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: pt-br
translationKey: stylex-personal-site
---

Troquei o Tailwind do [franklinjavier.com](https://franklinjavier.com) por StyleX. O site já era 100 no PageSpeed, JavaScript de bundle zero, fonte do sistema, uma foto. O LCP não saiu do lugar. Com o visual igual ao do ar, o CSS caiu 8% cru e 6% no gzip. Reverti a troca.

O que eu acabei publicando foi outra coisa: o `@tailwindcss/typography` que a home nunca pedia, um preflight mais magro, três scripts virando um. Tudo isso no Tailwind. O StyleX ficou no laboratório.

## O print do Aiden

Aiden Bai publicou no X uma troca Tailwind → StyleX no site dele. FCP 20% mais rápido, LCP 7%, CSS pela metade, JS 5% menor, INP 24ms iguais. Eu quis o mesmo tipo de experimento, no meu site, medido várias vezes antes e depois.

O print dele é o quadro. Não é o resultado.

## Antes de trocar

PageSpeed mobile, cinco vezes, produção com Tailwind: FCP 0,8s, LCP 1,1s, nota 100. Desktop uma vez: 0,3s / 0,3s. Não tem INP de campo no CrUX. Então não cito INP meu.

CSS da home: `BaseLayout.B8I3ZO9w.css`, 40325 bytes, 6932–6961 no gzip-6. Bundle `_astro` de JS: zero. O arquivo começa com `/*! tailwindcss v4.3.3`.

Lighthouse CLI 12.8.2 na mesma máquina, sem CDN, `master` contra o branch do StyleX: FCP 1051ms contra 1052ms, LCP 1351ms contra 1352ms. Empate. Neutro, nesse caso, é reverter.

## Laranja com laranja

A primeira preview do StyleX não era o mesmo site. Medir ali seria trapacear. Antes de qualquer número de depois, o visual tinha que estar pixel-perfect. Laranja com laranja.

No caminho apareceu um `src/styles/app.ts` de 837 linhas, um `stylex.create` só, uns 80 estilos reexportados. Tailwind sem Tailwind. Isso não fica.

O jeito que o [doc do StyleX](https://stylexjs.com/docs/learn/thinking-in-stylex) pede é outro. Colocalizar `*.stylex.ts` em cada view. Token só em `tokens.stylex.ts`. `create` local vira classe estática. Um arquivo CSS pequeno na frente. Carregar StyleX preguiçoso recalcula a página inteira.

## O que o StyleX moveu

Hash `zub4vcjma`, visual igual ao do ar. PageSpeed de novo, cinco vezes no mobile: FCP 0,8s em todas. LCP 1,1s em três, 0,8s em duas. Desktop 0,3 / 0,3. Nota 100. JS zero.

| | Tailwind no ar | StyleX `zub4vcjma` |
|---|---|---|
| FCP mobile (PageSpeed ×5) | 0,8s | 0,8s |
| LCP mobile (PageSpeed ×5) | 1,1s | 1,1s em 3, 0,8s em 2 |
| FCP / LCP desktop | 0,3 / 0,3 | 0,3 / 0,3 |
| Nota | 100 | 100 |
| CSS cru | 40325 | 36972 |
| CSS gzip-6 | 6932–6961 | 6499–6519 |
| HTML cru / gzip-6 | 14829 / 4289 | 14448 / 4523 |
| JS `_astro` | 0 | 0 |

Pixel-perfect comeu o ganho. Preflight, typography, line-height do v4, grid exclusivo em md e lg. Tudo isso voltou, e o CSS foi com ele.

## O resto do CSS não era StyleX

A home, o índice do blog e o speaking nunca usam `.prose`. O markdown ao vivo é `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre`, `hr`. Mesmo assim o dump do `@tailwindcss/typography` ia em toda página.

Para não creditar isso ao StyleX, subi o mesmo corte no Tailwind. Três hosts, mesmos bytes, gzip-6 com `mtime=0`.

| | A Tailwind, sem corte | B StyleX + cortes (não publicado) | C Tailwind + cortes (no ar) |
|---|---|---|
| CSS da home | `B8I3ZO9w` 40325 / 6932 | `0JEitMbP` 9475 / 2764 | `ClV8krB3` 15304 / 3519 |
| Home pede `prose.css` | sim | não | não |
| CSS do post `/blog/avoid-prop-drilling-react/` | 40325 / 6932 | 12982 / 3693 (prose 3507/929 + BaseLayout) | 18811 / 4448 (mesmo prose + BaseLayout) |
| HTML da home | 14829 / 4289 | 13445 / 4357 | 13909 / 4160 |
| HTML do post | 14874 / 4429 | 13491 / 4384 | 13675 / 4196 |
| JS `_astro` | 0 | 0 | 0 |

A para C é o corte que sobrou, sem StyleX. C para B é StyleX contra Tailwind com o corte igual: CSS menor, HTML gzip pior.

O que entrou no ar foi C. O [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45), commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472). Hoje o franklinjavier.com serve `BaseLayout.ClV8krB3.css` 15304/3519. A home não pede `prose.css`. O post carrega `prose.D-rI_UlP.css` 3507/929 mais o BaseLayout. O dump de 40325 não é mais produção.

O [PR do StyleX](https://github.com/franklinjavier/franklinjavier/pull/43) fechou sem merge.

Não rodei PageSpeed de novo depois do corte. Não invento LCP, FCP nem INP para o que está no ar agora.

## Átomo único comprime pior

HTML da home no C: 13909 / 4160. No StyleX com os mesmos cortes: 13445 / 4357. Menos HTML cru, gzip pior. Classe do Tailwind se repete. Átomo do StyleX é único.

O doc do StyleX diz que o CSS estabiliza quando o site cresce. Um site de uma foto não chega lá. O que esse site tinha de sobra era prose que a home não pedia. Isso eu cortei. A troca de sistema, não.
