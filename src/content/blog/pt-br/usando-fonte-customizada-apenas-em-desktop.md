---
title: Carregando webfonts apenas nos breakpoints de tablet e desktop
date: 2015-07-04
description: Técnica simples para otimizar seu site/projeto. Venha descobrir!
author: Franklin Javier
tags: front-end, css, optimization
lang: pt-br
translationKey: loading-webfonts-desktop-only
---

Usar webfont em seu site/projeto pode ser de fato interessante mas, dependendo do número
de fontes, o peso total da página pode aumentar consideravelmente.
Imagina então se o usuário estiver acessando de um celular?

Pensando nisso, implementei uma técnica simples de otimização nesse blog.
Seguindo o conceito de mobile first, por padrão o ```body``` recebe a fonte Arial e Serif.

```css
body {
  font-family: arial, serif;
}

@font-face {
  font-family: 'Lora';
  font-style: normal;
  font-weight: 400;
  src: local('Lora'),
    local('Lora-Regular'),
    url(http://fonts.gstatic.com/s/lora/v9/GsNxiN0oIzsS201cnUag6w.woff2)
    format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
```

Vale ressaltar que o browser só faz a requisição da fonte apenas se for usada
(até o momento o browser não a requisitou).
Agora com o uso de Media Queries, configuramos para usar a webfont **Lora**
assim que sair do breakpoint de mobile.

```css
@media (min-width: 768px) {
  body {
    font-family: 'Lora', arial, serif;
  }
}
```

Pronto. Redimensione seu brower até ver a diferença.

Simples não? Comente \o/

