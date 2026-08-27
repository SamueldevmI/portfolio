const CACHE = "grana-em-dia-v1";
const ARQUIVOS = ["./index.html", "./style.css", "./script.js", "./manifest.json", "../favicon.svg"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(
        caches.match(event.request).then((resposta) => {
            if (resposta) return resposta;
            return fetch(event.request)
                .then((rede) => {
                    const copia = rede.clone();
                    caches.open(CACHE).then((cache) => cache.put(event.request, copia));
                    return rede;
                })
                .catch(() => caches.match("./index.html"));
        })
    );
});
