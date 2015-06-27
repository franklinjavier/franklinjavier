/*
 * Main 
 */

(function() {

  'use strict';

  var forEach = Function.prototype.call.bind(Array.prototype.forEach);
  var links = document.querySelectorAll('a');

  forEach(links, function(a) { 

    // Links externos
    if ( a.hostname !== window.location.hostname ) {

        a.target = '_blank';
        a.onclick = function() {
          track('external', this.href);
        };
    } else {

      a.onclick = function() {
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

}());
