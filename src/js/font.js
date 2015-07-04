/*
(function(){

  'use strict';

  function createStyle(txt) {
    var style = document.createElement('style');
    style.textContent = txt;
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }

  var fontLsKey = 'sourceSansProV1';

  try {
    if (localStorage[fontLsKey]) {
      createStyle(localStorage[fontLsKey]);
    } else {
      var request = new XMLHttpRequest();
      request.open('GET', 'css/main.css?v1', true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          localStorage[fontLsKey] = request.responseText;
          createStyle(request.responseText);
        }
      }

      request.send();
    }
  } catch(ex) {}
}());
*/
