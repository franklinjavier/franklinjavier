// version 1.0

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('franklinjavier').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/main.css',
        '/img/avatar2.jpg',
        '/img/share-fb.svg',
        '/img/share-tt.svg',
        '/img/share-gp.svg',
        '/pages/about/',
        '/js/main.js'
      ])
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
