---
title: Loading Disqus when reaching the end of the page
date: 2015-07-06
description: Disqus is a powerful comment system used by millions of sites on the internet.
author: Franklin Javier
tags: front-end, javascript, optimization
lang: en
translationKey: loading-disqus-at-page-end
---

Disqus is a powerful comment system used by millions of sites on the internet.

I use this system right here on the blog and it's very easy to install.
Just create an account and paste a code snippet on your site.
By default, Disqus is loaded asynchronously, but when you access the page it's already loaded.

As a person who's obsessed with optimization, I'm a bit impatient in certain circumstances.
There's nothing worse than accessing a system or website and waiting an eternity to get a first response,
right? ._.

And how could we improve this? Easy: requesting only when necessary, that is, in this case when the user reaches the end of the page.

The code provided by them is this:

```javascript
var disqus_shortname = 'franklinjavier';

(function() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();
```

With that, we create an `onscroll` event and check when the user *scrolls* to the end of the page.
Notice that in my case, I added an *offset* of 500px to be able to load a little before reaching the end of the page.

Anyway, the complete code:

```javascript
var disqus_shortname = 'franklinjavier',
  disqus_url = "http://franklinjavier.com/";

(function() {

  'use strict';

  function load() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

    // Remove the event
    window.onscroll = function() {};
  }

  window.onscroll = function() {
    // When near the end of the page, load Disqus
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)) {
      load();
    }
  };

}());
```

Easy, right? Comment \o/
