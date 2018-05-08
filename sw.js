const CACHE_VERSION = "restaurant_app_v34";
const contentImgsCache = 'restaurant-content-imgs';

self.addEventListener("install", event => {
  const urlsToCache = [
    "/",
    "icon.png",
    "index.html",
    "restaurant.html",
    "offline.html",
    "/js/main.js",
    "/js/restaurant_info.js",
    "/libs/vender.js",
    "/css/over640.css",
    "/css/over1024.css",
    "/css/styles.css",
    "/css/normalize.css"
  ];

  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(cache => {
        console.log("cache all");
        return cache.addAll(urlsToCache);
      })
      .catch(() => {
        console.error("Cannot cache anything");
      })
  );
});

self.addEventListener("fetch", function (event) {
  function servePhoto(request) {
    var storageUrl = request.url.replace(/-\d+\.jpg$/, '');

    return caches.open(contentImgsCache).then(function(cache) {
      return cache.match(storageUrl).then(function(response) {
        if (response) return response;

        return fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        });
      });
    });
  }

  var requestUrl = new URL(event.request.url);

  // make sure the same origin
  if (requestUrl.origin === location.origin) {
    // cache the photo
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  // cache the assets
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    // Remove the old cache
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => {
            return name.startsWith("restaurant") && name != CACHE_VERSION;
          })
          .map(name => {
            return caches.delete(name);
          })
      );
    })
  );
});
