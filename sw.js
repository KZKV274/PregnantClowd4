// Baby Journey — Service Worker v5 (GitHub Pages ready)
const CACHE = 'baby-journey-v5';

// Кэшируем только то, что точно есть
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Добавляем файлы по одному, не падаем если что-то не загрузилось
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Шрифты Google — кэшируем
  if (url.hostname.includes('fonts.google') || url.hostname.includes('fonts.gstatic')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(hit => {
          if (hit) return hit;
          return fetch(e.request).then(resp => {
            cache.put(e.request, resp.clone());
            return resp;
          }).catch(() => null);
        })
      )
    );
    return;
  }

  // Всё остальное — сначала кэш, потом сеть
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => new Response('Offline — открой приложение когда будет сеть', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }));
    })
  );
});
