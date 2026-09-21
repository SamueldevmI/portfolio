// Baixar músicas do Audius pra ouvir sem internet: o áudio (e a capa) ficam guardados no aparelho.
import * as store from './store.js';
import { urlDeStream } from './audius.js';
import { gravarArquivo, apagarArquivo, gravarCapa } from './db.js';
import { avisar, avisarFixo, lista, icone } from './ui.js';

// a chave no IndexedDB é o próprio id da faixa ("a:XXXX")
let ocupado = false;

async function baixarUma(f, sinal) {
  const r = await fetch(urlDeStream(f.ref), { signal: sinal });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const audio = await r.blob();
  if (!audio.size) throw new Error('arquivo vazio');
  await gravarArquivo(f.id, audio);
  if (f.capa) {
    try {
      const c = await fetch(f.capa, { signal: sinal });
      const img = c.ok ? await c.blob() : null;
      if (img?.type.startsWith('image/')) await gravarCapa(f.id, img);
    } catch { /* sem capa: aparece o degradê */ }
  }
  store.adicionarBaixada(f, audio.size);
}

export const baixando = () => ocupado;

export async function baixarLista(faixas) {
  if (ocupado) { avisar('Já estou baixando. Espere terminar ou cancele.'); return; }
  const pendentes = faixas.filter((f) => f.src === 'audius' && !store.estaBaixadaId(f.id));
  if (!pendentes.length) { avisar('Isso já está baixado'); return; }

  ocupado = true;
  navigator.storage?.persist?.().catch(() => {}); // pede pro navegador não apagar os downloads sozinho
  const ctl = new AbortController();
  const barra = avisarFixo('Baixando…', { rotulo: 'Cancelar', fn: () => ctl.abort() });
  let ok = 0;
  let falhas = 0;
  let semEspaco = false;
  for (const [i, f] of pendentes.entries()) {
    if (ctl.signal.aborted) break;
    barra.texto(pendentes.length > 1 ? `Baixando ${i + 1} de ${pendentes.length}…` : 'Baixando…');
    try {
      await baixarUma(f, ctl.signal);
      ok++;
    } catch (e) {
      if (ctl.signal.aborted) break;
      if (e?.name === 'QuotaExceededError') { semEspaco = true; break; }
      falhas++;
    }
  }
  const cancelou = ctl.signal.aborted;
  barra.fechar();
  ocupado = false;
  if (semEspaco) avisar('Acabou o espaço do aparelho');
  else if (cancelou) avisar(ok ? `Cancelado. ${ok} já ${ok === 1 ? 'foi baixada' : 'foram baixadas'}` : 'Download cancelado');
  else if (falhas) avisar(`${ok} baixadas, ${falhas} falharam`);
  else avisar(ok === 1 ? '1 música baixada' : `${ok} músicas baixadas`);
}

export async function removerDownload(f) {
  try { await apagarArquivo(f.id); } catch { /* já não existia */ }
  store.removerBaixada(f.id);
}

export async function removerTodos() {
  for (const f of [...store.baixadas()]) await removerDownload(f);
}

// os botões "baixar tudo" das páginas mostram se a lista inteira já está no aparelho
export function atualizarBotoes() {
  document.querySelectorAll('[data-acao="baixar-tudo"]').forEach((b) => {
    const audius = lista(b.dataset.lista).filter((f) => f.src === 'audius');
    const todas = audius.length > 0 && audius.every((f) => store.estaBaixadaId(f.id));
    b.setAttribute('aria-pressed', todas);
    b.setAttribute('aria-label', todas ? 'Remover os downloads desta lista' : 'Baixar tudo pra ouvir sem internet');
    b.querySelector('use')?.setAttribute('href', `#i-${todas ? 'baixada' : 'baixar'}`);
  });
}

export const botaoBaixar = (chave, faixas) => {
  const audius = faixas.filter((f) => f.src === 'audius');
  if (!audius.length) return '';
  const todas = audius.every((f) => store.estaBaixadaId(f.id));
  return `<button class="icone" data-acao="baixar-tudo" data-lista="${chave}" aria-pressed="${todas}" aria-label="${todas ? 'Remover os downloads desta lista' : 'Baixar tudo pra ouvir sem internet'}">${icone(todas ? 'baixada' : 'baixar')}</button>`;
};
