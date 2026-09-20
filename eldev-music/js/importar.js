// Coloca músicas do próprio aparelho na coleção ("No aparelho").
import * as store from './store.js';
import { uid } from './util.js';
import { gravarArquivo, gravarCapa } from './db.js';
import { lerTags } from './id3.js';
import { avisar } from './ui.js';
import { navegar } from './nav.js';

const EXT = /\.(mp3|m4a|aac|flac|ogg|opus|wav|weba|webm)$/i;

// "Artista - Música.mp3" vira artista + título; sem o " - ", só o título
function doNome(nome) {
  const limpo = nome.replace(EXT, '').replace(/_/g, ' ').trim();
  const i = limpo.indexOf(' - ');
  return i > 0 ? { artista: limpo.slice(0, i).trim(), titulo: limpo.slice(i + 3).trim() } : { artista: 'Neste aparelho', titulo: limpo };
}

function medirDuracao(blob) {
  return new Promise((ok) => {
    const a = new Audio();
    const u = URL.createObjectURL(blob);
    const fim = (d) => {
      URL.revokeObjectURL(u);
      a.removeAttribute('src');
      ok(Number.isFinite(d) ? Math.round(d) : 0);
    };
    a.preload = 'metadata';
    a.onloadedmetadata = () => fim(a.duration);
    a.onerror = () => fim(0);
    setTimeout(() => fim(0), 6000);
    a.src = u;
  });
}

export async function importar(arquivos) {
  const lista = [...arquivos].filter((f) => f.type.startsWith('audio/') || EXT.test(f.name));
  if (!lista.length) return avisar('Escolha arquivos de áudio (mp3, m4a, flac, ogg, wav)');
  navigator.storage?.persist?.().catch(() => {}); // pede pro navegador não apagar os arquivos sozinho

  let ok = 0;
  let semEspaco = false;
  for (const [n, arq] of lista.entries()) {
    if (lista.length > 2) avisar(`Adicionando ${n + 1} de ${lista.length}…`);
    try {
      const tags = await lerTags(arq);
      const nome = doNome(arq.name);
      const id = uid();
      const duracao = await medirDuracao(arq);
      await gravarArquivo(id, arq);
      if (tags.capa) await gravarCapa(id, tags.capa).catch(() => {});
      store.adicionarMeu({
        id: `l:${id}`, src: 'local', ref: id,
        titulo: tags.titulo || nome.titulo, artista: tags.artista || nome.artista, duracao,
      });
      ok++;
    } catch (e) {
      if (e?.name === 'QuotaExceededError') { semEspaco = true; break; }
    }
  }
  if (semEspaco) avisar('Acabou o espaço do aparelho para guardar músicas');
  else if (!ok) avisar('Não consegui adicionar esses arquivos');
  else avisar(ok === 1 ? '1 música adicionada' : `${ok} músicas adicionadas`, location.hash === '#/meus' ? null : { rotulo: 'Ver', fn: () => navegar('#/meus') });
}
