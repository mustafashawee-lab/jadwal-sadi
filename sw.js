// خدمة العمل بدون إنترنت: الواجهة تنحفظ عند التثبيت، وصفحات الكتاب تنحفظ أول ما تنفتح
const CACHE = 'g6-v10';
const SHELL = ['./', './index.html', './manifest.json', './idara.html', './manifest-idara.json', './icon-idara-192.png', './icon-idara-512.png', './data/isl.json', './data/ar.json', './data/math.json', './data/sci.json', './data/soc.json', './data/gram.json', './data/en.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Firebase والترجمة دائماً من النت
  const isPage = url.pathname.includes('/pages/');
  if (isPage) {
    // صور الكتاب: من الذاكرة أولاً
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    })));
  } else {
    // الواجهة: من النت أولاً حتى توصل التحديثات، ومن الذاكرة إذا ماكو نت
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
  }
});
