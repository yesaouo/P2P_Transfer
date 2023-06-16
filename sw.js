self.addEventListener('install', (e) => {
    console.log("installing…");
    e.waitUntil(
        caches.open('ChatP2P-store').then((cache) => cache.addAll([
            '/index.html',
            '/peerjs.min.js',
            '/qrcode.min.js',
            '/img/cool.png',
            '/img/duplicate.png',
            '/img/plus.png',
            '/img/send.png',
            '/img/share.png',
            '/stickers/',
        ])),
    );
});
self.addEventListener("activate", (event) => {
    console.log("ready to handle fetches!");
    e.waitUntil(
        caches.keys().then((keyList) => {
            Promise.all(
                keyList.map((key) => {
                    if (key === cacheName) {return;}
                    caches.delete(key);
                })
            );
        })
    );
});  
self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});