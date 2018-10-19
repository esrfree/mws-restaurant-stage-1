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

    //only highjack request made to our app
    if (requestUrl.origin === location.origin) {
        //responWith restaurant.html if pathname startWith '/restaurant.html'
        if (requestUrl.pathname.startsWith('/restaurant.html')) {
            event.respondWith(caches.match('/restaurant.html'));
            return;
    }

    //if the request pathname starts with /img, then we need to handle images.
    if (requestUrl.pathname.startsWith('/img')) {
        event.respondWith(serveImage(event.request));
        return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function serveImage(request) {
  let imageStorageUrl = request.url;

  // Make a new URL with a stripped suffix and extension from the request url
  // we'll use this as the KEY for storing image into cache
  imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');

  return caches.open(imgCache).then(function(cache) {
    return cache.match(imageStorageUrl).then(function(response) {
      // if image is in cache, return it, else fetch from network, cache a clone, then return network response
      return response || fetch(request).then(function(networkResponse) {
        cache.put(imageStorageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
