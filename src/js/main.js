/*
 * Main 
 */

(function() {

  'use strict';

  var links = [].slice.call(document.querySelectorAll('a'), 0);

  links.forEach(function(a) { 

    // External links
    if (a.hostname !== window.location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener';
      a.onclick = function( e ) {
        track('external', this.href);
      };
    } else {
      a.onclick = function( e ) {
        track('post', this.href);
      };
    }

  });


  /*
   * Track user
   * ga('send', 'event', 'category', 'action', 'label');
   */
  function track(cat, url) {
    ga('send', 'event', cat, 'click', url);
  }


  /* 
   * Navigate through posts with J-K 
   * J - 106
   * K - 107
   */
  eventListener('keypress', function(e) {
    var keyCode = e.charCode || e.which;
    var prev = document.querySelector('.pagination .prev');
    var next = document.querySelector('.pagination .next');

    if (keyCode === 106 && prev) {
      prev.click();
    }

    if (keyCode === 107 && next) {
      next.click();
    }
  });

}());
  
/*
 * Load Disqus dinamically when scroll reach bottom of the pages
 */
(function() {
  'use strict';

  if (!window.disqus_shortname && !window.disqus_url) return;

  function preloadDisqus() {
    var dsq = document.createElement('script'); 
    dsq.type = 'text/javascript'; 
    dsq.async = true;
    dsq.src = 'https://' + disqus_shortname + '.disqus.com/embed.js';
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
