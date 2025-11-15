---
title: Carregando o Disqus ao chegar no fim da página
date: 2015-07-06
description: O Disqus é um sistema poderoso de comentários utilizado por milhões de sites na internet.
author: Franklin Javier
tags: front-end, javascript, optimization
---

O Disqus é um sistema poderoso de comentários utilizado por milhões de sites na internet. 

Aqui mesmo no blog eu uso esse sistema e é muito fácil de instalar. 
Basta criar uma conta e colar um trecho de código no seu site. 
Por padrão, o Disqus é carregado de forma assíncrona, porém ao acessar a página já é carregado. 

Como uma pessoa fanática por otimização, sou um pouco impaciente em certas circunstâncias. 
Não existe coisa pior que acessar um sistema ou site e esperar uma eternidade para ter uma primeira resposta, 
não é mesmo? ._.

E como poderíamos melhorar isso? Fácil: requisitando apenas quando necessário, ou seja, nesse caso quando o usuário chegar ao fim da página. 

O código fornecido por eles é esse aqui:

```javascript
var disqus_shortname = 'franklinjavier';

(function() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();
```

Com isso, criamos um evento ```onscroll``` e verificamos quando o usuário *scrollar* até o fim da página. 
Perceba que no meu caso, adicionei um *offset* de 500px para poder carregar um pouco antes de chegar ao fim da página.

Enfim, o código completo:

```javascript
var disqus_shortname = 'franklinjavier',
  disqus_url = "http://franklinjavier.com/";

(function() {

  'use strict';

  function load() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

    // Remove o evento
    window.onscroll = function() {};
  }

  window.onscroll = function() {
    // Ao chegar próximo ao fim da página, carrega o Disqus
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)) {
      load();
    }
  };

}());
```

Fácil não? Comente \o/
