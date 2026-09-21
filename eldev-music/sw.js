// Service worker: guarda o app no aparelho (abre sem internet) e lembra as últimas respostas do catálogo.
// Ao mudar qualquer arquivo do app, aumente o número em VERSAO pra todo mundo receber a versão nova.
const VERSAO = 'eldev-music-v3';
const CACHE_APP = `${VERSAO}-app`;
const CACHE_API = `${VERSAO}-api`;

const ARQUIVOS = [
  './', 'index.html', 'style.css', 'manifest.webmanifest',
  'js/app.js', 'js/audius.js', 'js/baixar.js', 'js/compartilhar.js', 'js/db.js', 'js/id3.js', 'js/importar.js',
  'js/instalar.js', 'js/menus.js', 'js/nav.js', 'js/player-ui.js', 'js/player.js', 'js/radio.js', 'js/store.js',
  'js/telas.js', 'js/ui.js', 'js/util.js', 'js/vitrola.js',
  'fonts/bricolage-latin.woff2', 'fonts/dmsans-latin.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.svg',
];

// O cache é um extra: se o navegador não deixar usar (espaço cheio, modo restrito), o app segue funcionando pela rede.
// Por isso nenhuma falha de cache pode impedir o service worker de instalar nem quebrar uma resposta.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_APP).then((c) => c.addAll(ARQUIVOS)).catch(() => {}).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => !k.startsWith(VERSAO)).map((k) => caches.delete(k))))
      .catch(() => {})
      .then(() => self.clients.claim()),
  );
});

const abrir = (nome) => caches.open(nome).catch(() => null);

async function aparar(cache, max) {
  const chaves = await cache.keys();
  if (chaves.length > max) await Promise.all(chaves.slice(0, chaves.length - max).map((k) => cache.delete(k)));
}

// rede primeiro (sempre a versão mais nova); sem internet, responde com o que estiver guardado
async function redePrimeiro(req, nomeCache, { limite = 0, reserva = null } = {}) {
  const cache = await abrir(nomeCache);
  try {
    const res = await fetch(req);
    if (cache && res.ok) {
      cache.put(req, res.clone()).catch(() => {});
      if (limite) aparar(cache, limite).catch(() => {});
    }
    return res;
  } catch {
    const guardada = cache && ((await cache.match(req).catch(() => null)) || (reserva && (await cache.match(reserva).catch(() => null))));
    return guardada || Response.error();
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(redePrimeiro(req, CACHE_APP, { reserva: req.mode === 'navigate' ? 'index.html' : null }));
  } else if (url.hostname === 'api.audius.co' && !url.pathname.endsWith('/stream')) {
    e.respondWith(redePrimeiro(req, CACHE_API, { limite: 80 }));
  }
  // o resto (áudio e capas) passa direto pela rede
});
