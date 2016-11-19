(function() {
  'use strict';

  /*
   * Load Disqus dinamically when scroll reach bottom of the pages
   */
  
  if (!window.disqus_shortname && !window.disqus_url) return;

  function preloadDisqus() {
    var dsq = document.createElement('script'); 
    dsq.type = 'text/javascript'; 
    dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

    // remove event
    window.onscroll = function() {};
  }

  window.onscroll = function(e) {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)) {
      preloadDisqus();
    }
  };

}());
