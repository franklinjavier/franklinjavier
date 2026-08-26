---
title: Troquei Tailwind por StyleX. O site não ficou mais rápido.
date: 2026-08-25
description: Migrei um site com nota 100 no PageSpeed para StyleX, medi o resultado e descobri que o ganho real estava em outro lugar.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: pt-br
translationKey: stylex-personal-site
---

Migrei o `franklinjavier.com` de Tailwind CSS para StyleX com uma pergunta simples: **a troca deixaria um site já otimizado ainda mais rápido?**

A resposta curta é não.

O site já marcava 100 no PageSpeed, não enviava JavaScript no bundle do Astro, usava a fonte do sistema e tinha apenas uma imagem relevante na página inicial. Depois de reproduzir o mesmo visual com StyleX, o FCP permaneceu em 0,8 s e o LCP não apresentou uma melhora consistente. O CSS ficou menor — cerca de 8% sem compressão e 6% em gzip —, mas isso não se traduziu em uma diferença perceptível de carregamento.

Por isso, reverti a migração.

O experimento, porém, revelou otimizações que não dependiam do StyleX: o `@tailwindcss/typography` era carregado em páginas que não o utilizavam, o preflight podia ser menor e três scripts podiam virar um. Essas mudanças foram aplicadas mantendo Tailwind.

## O que motivou o teste

[Aiden Bai publicou no X](https://x.com/aidenybai/status/2092021888642085254) os resultados de uma migração de Tailwind para StyleX no próprio site. No experimento dele, o FCP melhorou 20%, o LCP 7%, o CSS caiu pela metade e o JavaScript ficou 5% menor. O INP permaneceu em 24 ms.

Era um resultado interessante, mas servia apenas como ponto de partida. Sites diferentes têm conteúdos, pipelines e gargalos diferentes. O print do Aiden era a referência do experimento, não uma previsão para o meu site.

Eu queria repetir o processo em um ambiente que conheço bem: medir o estado atual várias vezes, migrar, garantir equivalência visual e medir novamente.

## O ponto de partida

Antes de alterar qualquer código, rodei o PageSpeed cinco vezes em produção, no perfil mobile. O resultado foi estável:

| Métrica | Resultado |
| --- | ---: |
| FCP mobile | 0,8 s |
| LCP mobile | 1,1 s |
| FCP desktop | 0,3 s |
| LCP desktop | 0,3 s |
| Nota do PageSpeed | 100 |
| JavaScript no bundle `_astro` | 0 |

O site ainda não possui dados de INP no CrUX. Portanto, não faria sentido atribuir ao projeto um número de INP baseado apenas em laboratório.

O CSS da página inicial era o arquivo `BaseLayout.B8I3ZO9w.css`, com 40.325 bytes sem compressão e entre 6.932 e 6.961 bytes usando gzip nível 6. O cabeçalho do arquivo confirmava o Tailwind CSS 4.3.3.

Também comparei `master` com o commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e) usando Lighthouse CLI 12.8.2, na mesma máquina e sem CDN:

| Versão | FCP | LCP |
| --- | ---: | ---: |
| Tailwind | 1.051 ms | 1.351 ms |
| StyleX | 1.052 ms | 1.352 ms |

Na prática, um empate.

## A primeira migração não valia como comparação

A primeira preview com StyleX parecia promissora, mas ainda não reproduzia exatamente o site em produção. Comparar os números naquele ponto seria creditar ao StyleX ganhos que poderiam ter vindo de diferenças no layout, na tipografia ou nos estilos removidos durante a implementação.

Antes de medir, a página precisava ser pixel-perfect. Laranja com laranja.

A primeira tentativa também concentrou praticamente tudo em um `src/styles/app.ts` com 837 linhas: um único `stylex.create` e cerca de 80 estilos reexportados. Era Tailwind escrito com outra sintaxe, sem aproveitar o modelo de composição do StyleX.

Reestruturei a implementação seguindo a organização recomendada pela [documentação do StyleX](https://stylexjs.com/docs/learn/thinking-in-stylex):

- estilos `*.stylex.ts` colocalizados com cada view;
- tokens compartilhados apenas em `tokens.stylex.ts`;
- chamadas locais a `stylex.create`, convertidas em classes estáticas;
- CSS inicial pequeno, sem carregar estilos de forma tardia e provocar uma nova recalculação da página.

Só depois dessa correção e da equivalência visual voltei a medir.

## O resultado com o mesmo visual

O commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e), publicado na preview `zub4vcjma`, reproduzia o visual da versão em produção. Rodei novamente o PageSpeed cinco vezes no mobile.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th>Métrica</th>
<th>Tailwind em produção</th>
<th>StyleX <a href="https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e"><code>d044686</code></a></th>
</tr>
</thead>
<tbody>
<tr><th scope="row">FCP mobile, cinco execuções</th><td>0,8 s</td><td>0,8 s</td></tr>
<tr><th scope="row">LCP mobile, cinco execuções</th><td>1,1 s</td><td>1,1 s em três; 0,8 s em duas</td></tr>
<tr><th scope="row">FCP/LCP desktop</th><td>0,3/0,3 s</td><td>0,3/0,3 s</td></tr>
<tr><th scope="row">Nota</th><td>100</td><td>100</td></tr>
<tr><th scope="row">CSS sem compressão</th><td>40.325 B</td><td>36.972 B</td></tr>
<tr><th scope="row">CSS em gzip-6</th><td>6.932–6.961 B</td><td>6.499–6.519 B</td></tr>
<tr><th scope="row">HTML sem compressão</th><td>14.829 B</td><td>14.448 B</td></tr>
<tr><th scope="row">HTML em gzip-6</th><td>4.289 B</td><td>4.523 B</td></tr>
<tr><th scope="row">JavaScript no bundle <code>_astro</code></th><td>0</td><td>0</td></tr>
</tbody>
</table>
</div>

O StyleX reduziu o CSS, mas não alterou o FCP. O LCP apresentou duas medições melhores, porém não de forma consistente o suficiente para atribuir o resultado à migração. O Lighthouse local também apontava empate.

Ao mesmo tempo, embora o HTML sem compressão fosse menor, sua versão comprimida ficou maior.

Para um site que já entregava nota 100, a redução de alguns bytes não justificava trocar todo o sistema de estilos sem um ganho mensurável para o usuário.

## O ganho real não vinha do StyleX

Durante a migração, encontrei um problema independente da ferramenta escolhida: a página inicial, o índice do blog e a página de palestras carregavam estilos do `@tailwindcss/typography`, embora nenhuma delas utilizasse `.prose`.

O conteúdo Markdown renderizado nos artigos usa elementos como `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre` e `hr`. A página inicial não precisava pagar por esses estilos.

Para não atribuir ao StyleX um ganho que vinha da remoção de CSS desnecessário, reproduzi o mesmo corte na versão com Tailwind. Passei então a comparar três estados:

- **A:** Tailwind original, sem o corte;
- **B:** StyleX com os cortes, não publicado;
- **C:** Tailwind com os mesmos cortes, publicado.

As medições foram feitas em três hosts, usando os mesmos arquivos e gzip nível 6 com `mtime=0`.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th>Recurso</th>
<th>A: Tailwind original</th>
<th>B: StyleX + cortes</th>
<th>C: Tailwind + cortes</th>
</tr>
</thead>
<tbody>
<tr><th scope="row">CSS da home</th><td>40.325 / 6.932 B</td><td>9.475 / 2.764 B</td><td>15.304 / 3.519 B</td></tr>
<tr><th scope="row">Home carrega <code>prose.css</code></th><td>Sim</td><td>Não</td><td>Não</td></tr>
<tr><th scope="row">CSS do artigo</th><td>40.325 / 6.932 B</td><td>12.982 / 3.693 B</td><td>18.811 / 4.448 B</td></tr>
<tr><th scope="row">HTML da home</th><td>14.829 / 4.289 B</td><td>13.445 / 4.357 B</td><td>13.909 / 4.160 B</td></tr>
<tr><th scope="row">HTML do artigo</th><td>14.874 / 4.429 B</td><td>13.491 / 4.384 B</td><td>13.675 / 4.196 B</td></tr>
<tr><th scope="row">JavaScript no bundle <code>_astro</code></th><td>0</td><td>0</td><td>0</td></tr>
</tbody>
</table>
</div>

Cada célula de tamanho mostra bytes sem compressão e bytes em gzip-6.

A comparação de **A para C** mostra o ganho obtido apenas com a limpeza do Tailwind. Já a comparação de **C para B** isola melhor a diferença entre StyleX e Tailwind depois que ambos recebem os mesmos cortes.

Nesse cenário, o StyleX produz menos CSS. Entretanto, o HTML comprimido da página inicial fica pior: 4.357 bytes contra 4.160 bytes no Tailwind.

## Menos HTML cru não significa menos HTML transferido

Na versão C, a página inicial gerava 13.909 bytes de HTML, ou 4.160 bytes comprimidos. Com StyleX e os mesmos cortes, eram 13.445 bytes sem compressão, mas 4.357 bytes em gzip.

Isso acontece porque as classes geradas pelo StyleX tendem a ser únicas, enquanto as classes utilitárias do Tailwind se repetem pelo documento. Repetição é exatamente o tipo de padrão que gzip comprime bem.

Portanto, olhar apenas o tamanho bruto teria levado à conclusão errada: o HTML do StyleX era menor no arquivo original, mas maior na transferência.

A documentação do StyleX argumenta que o CSS tende a se estabilizar conforme a aplicação cresce. É uma característica interessante para produtos grandes, com muitos componentes e combinações de estilo. Um site pessoal com uma foto e poucas páginas, porém, dificilmente chega ao ponto em que essa vantagem se torna relevante.

## O que foi publicado

A migração para StyleX permaneceu no laboratório. O [PR #43](https://github.com/franklinjavier/franklinjavier/pull/43) foi encerrado sem merge.

O que entrou em produção foi a versão C, ainda com Tailwind, no [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45) e commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472):

- o CSS do `@tailwindcss/typography` passou a ser carregado apenas nos artigos;
- o preflight foi reduzido;
- três scripts foram consolidados em um;
- o bundle `_astro` continuou sem JavaScript.

Hoje, a página inicial serve `BaseLayout.ClV8krB3.css`, com 15.304 bytes sem compressão e 3.519 bytes em gzip. Ela não solicita mais `prose.css`. Os artigos carregam `prose.D-rI_UlP.css`, com 3.507 bytes sem compressão e 929 bytes em gzip, além do CSS base.

Não rodei novamente o PageSpeed depois desse corte. Portanto, não atribuo novos valores de LCP, FCP ou INP à versão que está no ar. O que consigo afirmar é a redução dos recursos transferidos.

## Conclusão

O experimento não mostra que StyleX é lento, nem que Tailwind é sempre a melhor escolha. Mostra apenas que, **neste site e com este conteúdo**, a migração não produziu uma melhora de performance que justificasse a troca.

O StyleX gerou menos CSS. Mas o site já tinha JavaScript zero, nota 100 e tempos baixos. Depois que o visual ficou realmente equivalente, o ganho de CSS diminuiu, o HTML comprimido piorou e as métricas de carregamento permaneceram essencialmente iguais.

A parte mais valiosa da migração foi revelar desperdícios que existiam no projeto atual. Corrigi esses problemas sem trocar a ferramenta.

Essa foi a principal conclusão do teste: quando o resultado é neutro, reverter também é uma decisão de performance — especialmente se a migração aumenta a complexidade sem melhorar a experiência do usuário.
