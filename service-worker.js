/* Service Worker — ระบบแนะแนวการศึกษาและอาชีพ (PWA)
   แคชไฟล์แอปให้เปิดออฟไลน์ได้ ส่วนการส่งข้อมูลขึ้น Google Sheets
   จัดการโดยตัวแอป (คิวใน localStorage แล้วส่งเมื่อมีเน็ต) */

const CACHE = 'futureguide-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // แตะเฉพาะคำขอ GET ภายในโดเมนเดียวกัน (ไม่ยุ่งกับการ POST ไป Google Sheets)
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
