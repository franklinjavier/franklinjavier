---
title: Como compartilho links com meus agentes
date: 2026-10-21
description: O xmd recebe um link (post do X, artigo ou página que depende de JavaScript) e retorna só o conteúdo em Markdown. Sem login, sem chave e sem MCP.
author: Franklin Javier
tags: ia, agentes, tooling, open-source
lang: pt-br
translationKey: xmd-links-to-markdown-for-agents
---

Quando quero que um agente leia uma página, passo o link pelo xmd: `https://xmd.imfrank.dev/?url=` mais a URL. O agente recebe só o conteúdo, em Markdown. Não precisa de login, chave de API nem servidor MCP. Se o agente consegue fazer um GET, ele consegue usar. O código está em [github.com/franklinjavier/xmd](https://github.com/franklinjavier/xmd).

Eu uso isso no Grok Bot e no Claude, por exemplo para ler as respostas de um post no X.

## O HTML original é quase tudo ruído

Peguei uma resposta do @jack para testar. Um `curl` direto em `x.com/jack/status/2110642522355638381` retorna 160 KB de HTML. O texto do post está lá, no meio dos botões de "Log in" e "Sign up", mas as respostas não vêm. Pelo xmd, com `mode=replies`, a mesma URL vira 3,5 KB de Markdown com o post e 13 respostas.

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Link</th>
      <th scope="col">HTML original</th>
      <th scope="col">Saída do xmd</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Post do X, modo <code>replies</code></th>
      <td>160 KB, sem as respostas</td>
      <td>3,5 KB, post + 13 respostas</td>
    </tr>
    <tr>
      <th scope="row">MDN, status 418</th>
      <td>208 KB</td>
      <td>3,8 KB</td>
    </tr>
    <tr>
      <th scope="row"><a href="/pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/">Post do meu blog sobre StyleX</a></th>
      <td>49 KB</td>
      <td>12,5 KB, o Markdown que o próprio site serve</td>
    </tr>
    <tr>
      <th scope="row">Excalidraw (SPA, depende de JavaScript)</th>
      <td>6,9 KB, quase só script</td>
      <td>885 bytes, o texto da tela inicial</td>
    </tr>
  </tbody>
</table>
</div>

Os números são de 21 de outubro de 2026.

## Como usar

Dá para colar a URL direto no chat do agente, num `curl` ou num script:

```text
https://xmd.imfrank.dev/?url=https://x.com/jack/status/2110642522355638381&mode=replies
```

O `https://` é opcional: `?url=example.com` também funciona. Se o link tiver `?` ou `&`, ele precisa de URL encoding. Senão, os parâmetros dele se misturam com os do xmd. No terminal, o `curl` resolve isso:

```sh
curl -G 'https://xmd.imfrank.dev/' --data-urlencode 'url=https://example.com'
```

Também tem um CLI, que precisa do Bun 1.4 ou mais novo. Para instalar direto do GitHub:

```sh
bun add -g github:franklinjavier/xmd
```

Ou clonando o repo:

```sh
git clone https://github.com/franklinjavier/xmd && cd xmd && bun install && bun link
```

A instalação ocupa 34 MB em disco, quase tudo do `@cloudflare/puppeteer`, que o endpoint usa para abrir o browser. O comando é `xmd`, e `x-md` também funciona:

```sh
xmd https://example.com
xmd --mode replies https://x.com/jack/status/2110642522355638381
```

O CLI também pede primeiro o Markdown do site, mas, quando precisa converter, faz isso localmente, com um conversor de HTML embutido. Workers AI e Browser Run, que aparecem a seguir, só existem no endpoint.

## O xmd só converte quando o site não tem Markdown

Os links do X vão para a [API pública do FxTwitter](https://docs.fxembed.com/api/introduction/), que retorna o post em JSON sem pedir chave. O xmd monta o Markdown a partir desse JSON.

Para qualquer outro link, o xmd primeiro pede o Markdown para o próprio site. A requisição já vai com o header `Accept: text/markdown`. Se a resposta vier em HTML, ele procura um `<link rel="alternate" type="text/markdown">` na página e, se não achar, tenta a mesma URL com `.md` no fim, a convenção do [llms.txt](https://llmstxt.org/). Só se nada disso funcionar o HTML vai para o [`toMarkdown` do Workers AI](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/). Segundo a documentação da Cloudflare, essa conversão é grátis para a maioria dos formatos.

Meu blog responde em Markdown quando recebe esse header:

```text
$ curl -sI -H 'Accept: text/markdown' https://franklinjavier.com/pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/
HTTP/2 200
content-type: text/markdown; charset=utf-8
vary: Accept
```

Passando esse post pelo xmd, o Markdown vem do próprio site, sem conversão:

```text
x-xmd-engine: native
x-xmd-source: native
```

O MDN não retorna Markdown em nenhuma dessas tentativas, então o header mostra a conversão:

```text
x-xmd-engine: ai
x-xmd-source: ai
```

Algumas páginas só têm conteúdo depois que o JavaScript carrega. Quando a conversão vem vazia ou parece ser uma página desse tipo, o xmd abre o link no [Browser Run](https://developers.cloudflare.com/browser-run/), o Chrome headless da Cloudflare (o antigo Browser Rendering), e converte o HTML já renderizado. No Excalidraw, esse caminho levou 5 segundos num teste e 7 em outro, e retornou o texto que aparece na tela, inclusive o "Pick a tool & Start drawing!".

Os headers `x-xmd-source` e `x-xmd-engine` trazem o mesmo valor e dizem de onde veio cada resposta:

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Valor</th>
      <th scope="col">De onde veio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><code>native</code></th>
      <td>Markdown do próprio site (pelo <code>Accept</code>, pelo <code>rel=alternate</code> ou pela URL com <code>.md</code>)</td>
    </tr>
    <tr>
      <th scope="row"><code>x</code></th>
      <td>Post do X, pelo FxTwitter</td>
    </tr>
    <tr>
      <th scope="row"><code>ai</code></th>
      <td>HTML convertido pelo Workers AI</td>
    </tr>
    <tr>
      <th scope="row"><code>browser</code></th>
      <td>Página renderizada no Browser Run e convertida depois</td>
    </tr>
    <tr>
      <th scope="row"><code>fallback</code></th>
      <td>Conversor embutido, que também repassa texto puro sem mudar</td>
    </tr>
  </tbody>
</table>
</div>

## No X, o parâmetro mode define o que vem junto

Às vezes o post é uma resposta a alguém, ou o quinto post de uma thread. O parâmetro `mode` define o que vem junto com ele:

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Modo</th>
      <th scope="col">O que entra no Markdown</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><code>post</code></th>
      <td>Só o post do link. É o padrão.</td>
    </tr>
    <tr>
      <th scope="row"><code>ancestors</code></th>
      <td>A conversa desde o primeiro post até o do link, com no máximo 32 níveis.</td>
    </tr>
    <tr>
      <th scope="row"><code>thread</code></th>
      <td>A thread do autor, em ordem. As respostas de outras pessoas ficam de fora.</td>
    </tr>
    <tr>
      <th scope="row"><code>replies</code></th>
      <td>O post do link e as respostas a ele, de qualquer autor, em ordem cronológica. Os permalinks e as métricas vão para uma lista de referências no fim.</td>
    </tr>
  </tbody>
</table>
</div>

O começo do `replies` no post do @jack:

```markdown
## Replies to @jack

### 1/14 · jack (@jack)

@marcportermagee if you want. or use the screen.

### 2/14 · The Nth ° (@The_future_i)

@jack @marcportermagee Jack. Help a Jack.
```

## Uma extensão para não montar a URL na mão

O repo também tem uma extensão do Chrome, na pasta `extension/`. Um clique copia o link do xmd da aba aberta e abre esse link numa aba nova. Não está na Chrome Web Store. Para instalar:

```sh
curl -fsSL https://xmd.imfrank.dev/extension.sh | sh
```

O script baixa a extensão para `~/xmd-extension` e mostra os passos para carregar a pasta no Chrome.

## Onde ele falha

O `replies` traz só uma página de respostas. O post do @jack mostra 24 respostas, e vieram 13. O FxTwitter retorna uma página só, o xmd não pagina, e a saída termina com um aviso de que pode haver mais. Post apagado ou protegido não vem.

A conversão também não é perfeita. Na página do MDN, sobram os links "Skip to main content" e um pedaço do HTML original, `&lt;!doctype html>`, logo antes do título.

O browser tem cota. No plano grátis da Cloudflare são [10 minutos por dia, 3 browsers ao mesmo tempo e uma instância nova a cada 20 segundos](https://developers.cloudflare.com/browser-run/limits/). Quando o browser está ocupado, o xmd responde 503 com `Retry-After: 60`, e quando a cota do dia acaba, 503 até a meia-noite UTC. O próprio xmd também limita o browser a 3 páginas por minuto por IP.

O endpoint aceita 30 requisições fora do cache por minuto por IP e depois responde 429. Ele só busca páginas públicas: `localhost`, IPs privados e portas diferentes de 80 e 443 recebem 400 com "Blocked target".
