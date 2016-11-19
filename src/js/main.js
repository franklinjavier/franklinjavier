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
