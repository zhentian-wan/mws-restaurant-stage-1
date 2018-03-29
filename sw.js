const CACHE_VERSION = "restaurant_app_v27";

self.addEventListener("install", event => {
  const urlsToCache = [
    "/",
    "icon.png",
    "index.html",
    "restaurant.html",
    "offline.html",
    "dist/js/main.js",
    "dist/js/restaurant_info.js",
    "dist/libs/vender.js",
    "dist/css/over640.css",
    "dist/css/over1024.css",
    "dist/css/styles.css",
    "dist/css/normalize.css"
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

self.addEventListener("fetch", function(event) {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    /*if (requestUrl.pathname === "/") {
      console.log("fetch skelton");
      event.respondWith(caches.match("/skelton"));
    }*/

  }

  event.respondWith(
    // Fetch the static assets
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
        .catch((err) => {
          console.log(err)
      });
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
