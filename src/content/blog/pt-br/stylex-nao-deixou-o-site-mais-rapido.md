---
title: Experimento de performance com StyleX da Meta
date: 2026-08-25
description: Experimentei trocar o Tailwind por StyleX e não melhorou nada em performance.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: pt-br
translationKey: stylex-personal-site
---

Troquei o Tailwind do [franklinjavier.com](https://franklinjavier.com) por StyleX. O site já era 100 no PageSpeed, JavaScript de bundle zero, fonte do sistema, uma foto. O LCP não saiu do lugar. Com o visual igual ao do ar, o CSS caiu 8% cru e 6% no gzip. Reverti a troca.

O que eu acabei publicando foi outra coisa: o `@tailwindcss/typography` que a home nunca pedia, um preflight mais magro, três scripts virando um. Tudo isso no Tailwind. O StyleX ficou no laboratório.

## O print do Aiden

Aiden Bai publicou no X uma troca Tailwind → StyleX no site dele. FCP 20% mais rápido, LCP 7%, CSS pela metade, JS 5% menor, INP 24ms iguais. Eu quis o mesmo tipo de experimento, no meu site, medido várias vezes antes e depois.

![Print do Aiden Bai no X: Tailwind para StyleX, FCP 20% mais rápido, LCP 7%, CSS pela metade](/img/blog/aiden-bai-stylex.png)

O print dele é a referência. Não é o resultado.

## Antes de trocar

PageSpeed mobile, cinco vezes, produção com Tailwind: FCP 0,8s, LCP 1,1s, nota 100. Desktop uma vez: 0,3s / 0,3s. Não tem INP de campo no CrUX. Então não cito INP meu.

CSS da home: `BaseLayout.B8I3ZO9w.css`, 40325 bytes, 6932–6961 no gzip-6. Bundle `_astro` de JS: zero. O arquivo começa com `/*! tailwindcss v4.3.3`.

Lighthouse CLI 12.8.2 na mesma máquina, sem CDN, `master` contra [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e): FCP 1051ms contra 1052ms, LCP 1351ms contra 1352ms. Empate. Neutro, nesse caso, é reverter.

## Laranja com laranja

A primeira preview do StyleX não era o mesmo site. Medir ali seria trapacear. Antes de qualquer número de depois, o visual tinha que estar pixel-perfect. Laranja com laranja.

No caminho apareceu um `src/styles/app.ts` de 837 linhas, um `stylex.create` só, uns 80 estilos reexportados. Tailwind sem Tailwind. Isso não fica.

O jeito que o [doc do StyleX](https://stylexjs.com/docs/learn/thinking-in-stylex) pede é outro. Colocalizar `*.stylex.ts` em cada view. Token só em `tokens.stylex.ts`. `create` local vira classe estática. Um arquivo CSS pequeno no começo. Carregar o CSS do StyleX sob demanda recalcula a página inteira.

## O que o StyleX moveu

Commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e), preview `zub4vcjma`, visual igual ao do ar. PageSpeed de novo, cinco vezes no mobile: FCP 0,8s em todas. LCP 1,1s em três, 0,8s em duas. Desktop 0,3 / 0,3. Nota 100. JS zero.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>Tailwind no ar</th>
<th>StyleX <a href="https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e"><code>d044686</code></a> <code>zub4vcjma</code></th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">FCP mobile (PageSpeed ×5)</th>
<td>0,8s</td>
<td>0,8s</td>
</tr>
<tr>
<th scope="row">LCP mobile (PageSpeed ×5)</th>
<td>1,1s</td>
<td>1,1s em 3, 0,8s em 2</td>
</tr>
<tr>
<th scope="row">FCP / LCP desktop</th>
<td>0,3 / 0,3</td>
<td>0,3 / 0,3</td>
</tr>
<tr>
<th scope="row">Nota</th>
<td>100</td>
<td>100</td>
</tr>
<tr>
<th scope="row">CSS cru</th>
<td>40325</td>
<td>36972</td>
</tr>
<tr>
<th scope="row">CSS gzip-6</th>
<td>6932–6961</td>
<td>6499–6519</td>
</tr>
<tr>
<th scope="row">HTML cru / gzip-6</th>
<td>14829 / 4289</td>
<td>14448 / 4523</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

Pixel-perfect comeu o ganho. Preflight, typography, line-height do v4, grid exclusivo em md e lg. Tudo isso voltou, e o CSS foi com ele.

## O resto do CSS não era StyleX

A home, o índice do blog e o speaking nunca usam `.prose`. O markdown ao vivo é `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre`, `hr`. Mesmo assim o dump do `@tailwindcss/typography` ia em toda página.

Para não creditar isso ao StyleX, subi o mesmo corte no Tailwind. Três hosts, mesmos bytes, gzip-6 com `mtime=0`.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>A Tailwind, sem corte</th>
<th>B StyleX + cortes (não publicado)</th>
<th>C Tailwind + cortes (no ar)</th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">CSS da home</th>
<td><code>B8I3ZO9w</code> 40325 / 6932</td>
<td><code>0JEitMbP</code> 9475 / 2764</td>
<td><code>ClV8krB3</code> 15304 / 3519</td>
</tr>
<tr>
<th scope="row">Home pede <code>prose.css</code></th>
<td>sim</td>
<td>não</td>
<td>não</td>
</tr>
<tr>
<th scope="row">CSS do post <code>/blog/avoid-prop-drilling-react/</code></th>
<td>40325 / 6932</td>
<td>12982 / 3693 (prose 3507/929 + BaseLayout)</td>
<td>18811 / 4448 (mesmo prose + BaseLayout)</td>
</tr>
<tr>
<th scope="row">HTML da home</th>
<td>14829 / 4289</td>
<td>13445 / 4357</td>
<td>13909 / 4160</td>
</tr>
<tr>
<th scope="row">HTML do post</th>
<td>14874 / 4429</td>
<td>13491 / 4384</td>
<td>13675 / 4196</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

A para C é o corte que sobrou, sem StyleX. C para B é StyleX contra Tailwind com o corte igual: CSS menor, HTML gzip pior.

O que entrou no ar foi C. O [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45), commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472). Hoje o franklinjavier.com serve `BaseLayout.ClV8krB3.css` 15304/3519. A home não pede `prose.css`. O post carrega `prose.D-rI_UlP.css` 3507/929 mais o BaseLayout. O dump de 40325 não é mais produção.

O [PR do StyleX](https://github.com/franklinjavier/franklinjavier/pull/43) fechou sem merge.

Não rodei PageSpeed de novo depois do corte. Não invento LCP, FCP nem INP para o que está no ar agora.

## Classe que não se repete comprime pior

HTML da home no C: 13909 / 4160. No StyleX com os mesmos cortes: 13445 / 4357. Menos HTML cru, gzip pior. O nome de classe do StyleX é único. O do Tailwind se repete.

O doc do StyleX diz que o CSS estabiliza quando o site cresce. Um site de uma foto não chega lá. O que esse site tinha de sobra era prose que a home não pedia. Isso eu cortei. A troca de sistema, não.
