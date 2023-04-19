let cacheData = 'appV1';
const dynamicCacheName = 'appV1DynamicCache';
const assets = [
  'index.html',
  '/static/js',
  '/icons',
  '/static/media',
  '/static/css',
  '/style.css',
  '/app.js',
  '/',
];
// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};
// install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheData).then((cache) => {
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== cacheData && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// fetch
self.addEventListener('fetch', (event) => {
  if (navigator.onLine) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        const response = await fetch(event.request);

        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        const cache = await caches.open(dynamicCacheName);
        await cache.put(event.request, response.clone());

        return response;
      })()
    );
  } else {
    event.waitUntil(
      registration.showNotification('Internet', {
        body: 'Internet Not Working',
      })
    );
  }
});