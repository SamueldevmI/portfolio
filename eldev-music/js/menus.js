// Menus que sobem de baixo: opções da música, escolher playlist, fila de reprodução.
import * as store from './store.js';
import * as player from './player.js';
import { apagarArquivo } from './db.js';
import { esc } from './util.js';
import { abrirFolha, fecharFolha, folhaAberta, cabecaFolha, avisar, perguntar, icone, capaHtml, capaPeq } from './ui.js';
import { navegar } from './nav.js';

let alvo = null; // { faixa, playlistId }: sobre qual música o menu aberto está falando

export function menuFaixa(f, { playlistId = '' } = {}) {
  alvo = { faixa: f, playlistId };
  const curtida = store.curtida(f.id);
  abrirFolha({
    rotulo: `Opções de ${f.titulo}`,
    cabeca: cabecaFolha(capaPeq(f), f.id, f.titulo, f.artista, f.espelhos || []),
    itens: [
      { icone: curtida ? 'estrela-cheia' : 'estrela', texto: curtida ? 'Tirar das favoritas' : 'Favoritar', acao: 'm-curtir' },
      { icone: 'next', texto: 'Tocar em seguida', acao: 'm-seguinte' },
      { icone: 'fila', texto: 'Adicionar à fila', acao: 'm-fila' },
      { icone: 'add-lista', texto: 'Adicionar à playlist…', acao: 'm-playlist' },
      playlistId && { icone: 'lixo', texto: 'Remover desta playlist', acao: 'm-tirar' },
      f.src === 'audius' && f.artistaId && { icone: 'pessoa', texto: 'Ir para o artista', acao: 'm-artista' },
      f.src === 'audius' && f.link && { icone: 'compartilhar', texto: 'Compartilhar', acao: 'm-compartilhar' },
      f.src === 'local' && { icone: 'lixo', texto: 'Apagar do aparelho', acao: 'm-apagar', cls: 'perigo' },
    ].filter(Boolean),
  });
}

export function escolherPlaylist(f) {
  alvo = { faixa: f, playlistId: '' };
  abrirFolha({
    rotulo: 'Adicionar à playlist',
    cabeca: '<h2 class="folha-titulo">Adicionar à playlist</h2>',
    itens: [
      { icone: 'adicionar', texto: 'Nova playlist', acao: 'm-nova' },
      ...store.playlists().map((p) => ({
        icone: 'biblioteca', texto: p.nome, acao: 'm-add', dados: { id: p.id }, marca: p.faixas.some((x) => x.id === f.id),
      })),
    ],
  });
}

export async function novaPlaylist(faixa = null) {
  const nome = await perguntar({ titulo: 'Nova playlist', campo: { rotulo: 'Nome da playlist', valor: '' }, ok: 'Criar' });
  if (nome === null) return null;
  const p = store.criarPlaylist(nome, faixa ? [faixa] : []);
  avisar(`Playlist “${p.nome}” criada`);
  return p;
}

export function abrirFila() {
  const e = player.estado();
  const linhas = e.lista.map((f, i) => `
    <div class="faixa ${i === e.indice ? 'tocando' : ''}" data-id="${esc(f.id)}">
      <button class="faixa-tocar" data-acao="fila-ir" data-i="${i}" aria-label="Tocar ${esc(f.titulo)}">
        ${capaHtml(capaPeq(f), f.id, '', f.espelhos || [])}
        <span class="faixa-txt"><b>${esc(f.titulo)}</b><span>${esc(f.artista)}</span></span>
      </button>
      ${i === e.indice
        ? '<span class="mais" aria-hidden="true"></span>'
        : `<button class="mais" data-acao="fila-tirar" data-i="${i}" aria-label="Tirar ${esc(f.titulo)} da fila">${icone('x')}</button>`}
    </div>`).join('');
  const abrindo = !folhaAberta();
  abrirFolha({
    rotulo: 'Fila de reprodução', tipo: 'fila',
    corpo: `<h2 class="folha-titulo">Fila de reprodução</h2>${
      linhas ? `<div class="lista">${linhas}</div>` : '<p class="sub" style="padding:12px">A fila está vazia.</p>'}`,
  });
  if (abrindo) document.querySelector('#folha .tocando')?.scrollIntoView({ block: 'center' });
}

// a fila muda com a folha aberta (tirar música, aleatório): redesenha no mesmo lugar
player.on('fila', () => {
  if (folhaAberta() && document.getElementById('folha').dataset.tipo === 'fila') abrirFila();
});
player.on('faixa', () => {
  if (folhaAberta() && document.getElementById('folha').dataset.tipo === 'fila') abrirFila();
});

export async function compartilhar(f) {
  if (!f.link) return avisar('Só músicas do Audius têm link pra compartilhar');
  try {
    if (navigator.share) await navigator.share({ title: f.titulo, text: `${f.titulo}, de ${f.artista}`, url: f.link });
    else {
      await navigator.clipboard.writeText(f.link);
      avisar('Link copiado');
    }
  } catch (e) {
    if (e.name !== 'AbortError') avisar('Não consegui compartilhar');
  }
}

export const acoesMenu = {
  'm-curtir': () => {
    const on = store.alternarCurtida(alvo.faixa);
    fecharFolha();
    avisar(on ? 'Adicionada às Favoritas' : 'Removida das Favoritas');
  },
  'm-seguinte': () => { player.tocarEmSeguida(alvo.faixa); fecharFolha(); avisar('Vai tocar em seguida'); },
  'm-fila': () => { player.adicionarNaFila(alvo.faixa); fecharFolha(); avisar('Adicionada à fila'); },
  'm-playlist': () => escolherPlaylist(alvo.faixa),
  'm-tirar': () => {
    store.removerDaPlaylist(alvo.playlistId, alvo.faixa.id);
    fecharFolha();
    avisar('Removida da playlist');
  },
  'm-artista': () => { const id = alvo.faixa.artistaId; fecharFolha(); navegar(`#/artista/${encodeURIComponent(id)}`); },
  'm-compartilhar': () => { const f = alvo.faixa; fecharFolha(); compartilhar(f); },
  'm-add': (el) => {
    const p = store.playlist(el.dataset.id);
    const novo = store.adicionarNaPlaylist(el.dataset.id, alvo.faixa);
    fecharFolha();
    avisar(novo ? `Adicionada a “${p.nome}”` : `Já estava em “${p.nome}”`);
  },
  'm-nova': () => { const f = alvo.faixa; fecharFolha(); novaPlaylist(f); },
  'm-apagar': async () => {
    const f = alvo.faixa;
    fecharFolha();
    const ok = await perguntar({
      titulo: 'Apagar do aparelho?', ok: 'Apagar', perigo: true,
      texto: `“${f.titulo}” sai da sua coleção, das playlists e das favoritas.`,
    });
    if (!ok) return;
    player.esquecer(f.id);
    try { await apagarArquivo(f.ref); } catch { /* já não existia */ }
    store.esquecerFaixa(f.id);
    avisar('Arquivo apagado');
  },
  'fila-ir': (el) => player.irPara(+el.dataset.i),
  'fila-tirar': (el) => player.removerDaFila(+el.dataset.i),
};
