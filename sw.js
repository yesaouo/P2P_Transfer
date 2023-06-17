let cacheName = "store-v1.0";
var assets = [
    '/P2P_Transfer/',
    '/P2P_Transfer/index.html',
    '/P2P_Transfer/peerjs.min.js',
    '/P2P_Transfer/qrcode.min.js',
    '/P2P_Transfer/img/cool.png',
    '/P2P_Transfer/img/duplicate.png',
    '/P2P_Transfer/img/plus.png',
    '/P2P_Transfer/img/send.png',
    '/P2P_Transfer/img/share.png',
    '/P2P_Transfer/img/wifi-slash.png'
];
for (var i = 0; i <= 39; i++) {
    var stickerPath = '/P2P_Transfer/stickers/sticker' + i + '.png';
    assets.push(stickerPath);
}

self.addEventListener('install', (e) => {
    console.log("installing...");
    e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});
self.addEventListener("activate", (e) => {
    console.log("ready to handle fetches!");
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== cacheName) {return caches.delete(key);}
                })
            );
        })
    );
});  
self.addEventListener('fetch', (e) => {
    console.log("fetch", e.request.url);
    e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});