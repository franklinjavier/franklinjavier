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
        a.onclick = function( e ) {
          track('external', this.href);
        };

    } else {

      a.onclick = function( e ) {
        track('post', this.href);
        animate( e, this.href );
      };
    }

  });


  function animate( e, url ) {
    e.preventDefault();
    document.body.className += ' animated fadeOut';
    setTimeout(function() {
      window.location = url;
    }, 200);
  }


  /*
   * Track user
   * ga('send', 'event', 'category', 'action', 'label');
   */
  function track(cat, url) {
    ga('send', 'event', cat, 'click', url);
  }

}());
