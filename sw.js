const CACHE_NAME = 'polyphonic-v1';
const ASSETS = [
  '/polyphonic2049/',
  '/polyphonic2049/index.html',
  '/polyphonic2049/app.js',
  '/polyphonic2049/manifest.json',
  '/polyphonic2049/icons/icon-192.png',
  '/polyphonic2049/icons/icon-512.png'
];

/* 설치 시 핵심 파일 캐시 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* 활성화 시 구버전 캐시 삭제 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* 요청 가로채기 - 네트워크 우선, 실패 시 캐시 */
self.addEventListener('fetch', (e) => {
  /* Firebase / Google API 요청은 캐시하지 않음 */
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('unpkg')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
