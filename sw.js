var staticCache = "mws-restaurant-stage-1";
var imgCache = "mws-restaurant-stage-1" + "-images";

/* Placing all caches in an array */
var allCaches = [staticCache, imgCache];

/*Cache all the static parts */
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCache).then(function(cache) {
            return cache.addAll([
                '/',
                '/restaurant.html',
                '/css/styles.css',
                '/js/dbhelper.js',
                '/js/main.js',
                '/js/restaurant_info.js',
                'js/register-sw.js',
                'data/restaurants.json'
            ]).catch(error => {
                console.log("Caches open fail: " + error);
            });
        })
    );
});

/* At Service Worker Activation and Deletion of previous caches if any */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith("mws-") &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

/* Hijack fetch requests and respond accordingly */
self.addEventListener('fetch', function(event) {
    const requestUrl = new URL(event.request.url);
    
    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname.startsWith('/restaurant.html')) {
            event.respondWith(caches.match('/restaurant.html'));
            return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
