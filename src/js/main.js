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
        //animate( e, this.href );
      };
    }

  });


  /*
   * Transition before redirect
   */
  function animate( e, url ) {
    e.preventDefault();
    document.body.className += ' animated fadeOut';
    window.location = url;
  }


  /*
   * Track user
   * ga('send', 'event', 'category', 'action', 'label');
   */
  function track(cat, url) {
    ga('send', 'event', cat, 'click', url);
  }


  /* 
   * Navigate through posts with J-K 
   */
  window.onkeypress = function( e ) {

    // J - 106
    // K - 107

    var keyCode = e.charCode || e.which,
      prev = document.querySelector('.pagination .prev'),
      next = document.querySelector('.pagination .next');

    if ( keyCode === 106 && prev ) {
      prev.click();
    }

    if ( keyCode === 107 && next ) {
      next.click();
    }
  };


}());
