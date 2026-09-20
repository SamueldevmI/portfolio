// Arquivos de música do próprio usuário (IndexedDB) e as capas tiradas deles.
import { urlSegura } from './util.js';

let abrindo = null;

function abrir() {
  abrindo ??= new Promise((ok, falha) => {
    const r = indexedDB.open('eldev-music', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('arquivos', { keyPath: 'id' });
      r.result.createObjectStore('capas', { keyPath: 'id' });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => { abrindo = null; falha(r.error); };
  });
  return abrindo;
}

async function usar(loja, modo, fn) {
  const db = await abrir();
  return new Promise((ok, falha) => {
    const t = db.transaction(loja, modo);
    const req = fn(t.objectStore(loja));
    t.oncomplete = () => ok(req?.result);
    t.onerror = t.onabort = () => falha(t.error);
  });
}

export const gravarArquivo = (id, blob) => usar('arquivos', 'readwrite', (s) => s.put({ id, blob }));
export const lerArquivo = (id) => usar('arquivos', 'readonly', (s) => s.get(id)).then((r) => r?.blob ?? null);

// capas ficam como endereços blob: na memória; carregarCapas() recria eles ao abrir o app
const urlsCapa = new Map();

export async function gravarCapa(id, blob) {
  await usar('capas', 'readwrite', (s) => s.put({ id, blob }));
  urlsCapa.set(id, URL.createObjectURL(blob));
}

export async function apagarArquivo(id) {
  await Promise.all([
    usar('arquivos', 'readwrite', (s) => s.delete(id)),
    usar('capas', 'readwrite', (s) => s.delete(id)),
  ]);
  const u = urlsCapa.get(id);
  if (u) URL.revokeObjectURL(u);
  urlsCapa.delete(id);
}

export async function apagarTudoLocal() {
  await Promise.all([
    usar('arquivos', 'readwrite', (s) => s.clear()),
    usar('capas', 'readwrite', (s) => s.clear()),
  ]);
  urlsCapa.forEach((u) => URL.revokeObjectURL(u));
  urlsCapa.clear();
}

export async function carregarCapas() {
  try {
    const todas = await usar('capas', 'readonly', (s) => s.getAll());
    for (const { id, blob } of todas || []) urlsCapa.set(id, URL.createObjectURL(blob));
  } catch {
    /* sem IndexedDB (aba anônima, por exemplo): segue sem as capas dos arquivos */
  }
}

// endereço da capa de qualquer faixa, do Audius ou do aparelho
export const capaDe = (f) => (f.src === 'local' ? urlsCapa.get(f.ref) || '' : urlSegura(f.capa));
