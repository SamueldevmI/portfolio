// v2: a v1 guardava tudo pra sempre ("cache primeiro"), inclusive as respostas da API. Quem já tinha
// visitado nunca recebia correções do site (nem a de segurança) e via a lista de gastos congelada.
// Trocar o nome do cache faz o "activate" abaixo apagar o antigo.
const CACHE = "grana-em-dia-v2";
const ARQUIVOS = ["./", "./index.html", "./style.css", "./script.js?v=20260930csp", "./manifest.json", "../favicon.svg"];

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

// Rede primeiro: com internet vem sempre a versão atual (e ela é guardada); sem internet, a guardada.
// A API fica de fora: ela é de outro endereço e os gastos precisam vir sempre frescos.
self.addEventListener("fetch", (event) => {
    const pedido = event.request;
    if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;
    event.respondWith(
        fetch(pedido)
            .then((rede) => {
                if (rede.ok) {
                    const copia = rede.clone();
                    caches.open(CACHE).then((cache) => cache.put(pedido, copia));
                }
                return rede;
            })
            .catch(() => caches.match(pedido).then((guardada) => guardada || caches.match("./index.html")))
    );
});
