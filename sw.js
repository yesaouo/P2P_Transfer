self.addEventListener('install', (e) => {
    console.log("installing…");
    e.waitUntil(
        caches.open('ChatP2P-store').then((cache) => cache.addAll([
            '/P2P_Transfer/',
            '/P2P_Transfer/index.html',
            '/P2P_Transfer/peerjs.min.js',
            '/P2P_Transfer/qrcode.min.js',
            '/P2P_Transfer/img/cool.png',
            '/P2P_Transfer/img/duplicate.png',
            '/P2P_Transfer/img/plus.png',
            '/P2P_Transfer/img/send.png',
            '/P2P_Transfer/img/share.png',
            '/P2P_Transfer/stickers/',
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