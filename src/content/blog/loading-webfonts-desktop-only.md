---
title: Loading webfonts only on tablet and desktop breakpoints
date: 2015-07-04
description: Simple technique to optimize your site/project. Come discover!
author: Franklin Javier
tags: front-end, css, optimization
lang: en
translationKey: loading-webfonts-desktop-only
---

Using webfonts on your site/project can indeed be interesting but, depending on the number
of fonts, the total page weight can increase considerably.
Imagine then if the user is accessing from a mobile phone?

Thinking about this, I implemented a simple optimization technique on this blog.
Following the mobile first concept, by default the `body` receives the Arial and Serif font.

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

It's worth noting that the browser only makes the font request only if it's used
(so far the browser hasn't requested it).
Now with the use of Media Queries, we configure to use the **Lora** webfont
as soon as it leaves the mobile breakpoint.

```css
@media (min-width: 768px) {
  body {
    font-family: 'Lora', arial, serif;
  }
}
```

Done. Resize your browser to see the difference.

Simple, right? Comment \o/
