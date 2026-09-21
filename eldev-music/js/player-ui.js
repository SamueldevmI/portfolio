// A parte visual do player: mini player embaixo, player em tela cheia e as teclas do computador.
import * as player from './player.js';
import * as store from './store.js';
import { $, $$, esc, fmtTempo, hash } from './util.js';
import { icone, discoHtml, avisar } from './ui.js';
import { capaDe } from './db.js';
import { abrirCamada, fecharCamada, navegar } from './nav.js';
import { menuFaixa, escolherPlaylist, abrirFila, abrirTimer, compartilhar } from './menus.js';
import { montarVitrola, girando } from './vitrola.js';
import { atualizarBotoes } from './baixar.js';
import { luzesDoPlayer } from './luzes.js';

const enc = encodeURIComponent;

const controles = () => `<div class="controles">
  <button class="ctl js-emb" data-acao="embaralhar" aria-label="Aleatório" aria-pressed="false">${icone('shuffle')}</button>
  <button class="ctl" data-acao="anterior" aria-label="Anterior">${icone('prev')}</button>
  <button class="ctl ctl-play js-play" data-acao="alternar" aria-label="Tocar">${icone('play', 'ic-play')}${icone('pause', 'ic-pause')}<span class="roda"></span></button>
  <button class="ctl" data-acao="proxima" aria-label="Próxima">${icone('next')}</button>
  <button class="ctl js-rep" data-acao="repetir" aria-label="Repetir" aria-pressed="false" data-modo="off">${icone('repeat')}</button>
</div>`;

const barra = () => `<div class="seek-linha">
  <span class="t-atual">0:00</span>
  <input class="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Posição da música">
  <span class="t-total">0:00</span>
</div>`;

// no player cheio a barra é uma onda sonora (o input fica por cima, invisível, só pra mexer)
const barraOnda = () => `<div class="seek-linha">
  <span class="t-atual">0:00</span>
  <div class="onda"><input class="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Posição da música"></div>
  <span class="t-total">0:00</span>
</div>`;

// desenho da onda: barrinhas com altura parecida com uma música de verdade, sempre a mesma para a mesma faixa
function ondaDe(id) {
  const n = 64;
  let h = hash(id) || 1;
  const sorteio = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const a = sorteio() * 6.28;
  const b = sorteio() * 6.28;
  let barras = '';
  for (let i = 0; i < n; i++) {
    const v = 0.5 + 0.22 * Math.sin(i * 0.28 + a) + 0.16 * Math.sin(i * 0.83 + b) + 0.24 * (sorteio() - 0.5);
    const alt = Math.max(0.14, Math.min(1, v)) * 100;
    barras += `<rect x="${i * 4}" y="${((100 - alt) / 2).toFixed(1)}" width="2.6" height="${alt.toFixed(1)}" rx="1.3"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n * 4 - 1.4} 100" preserveAspectRatio="none">${barras}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const curtirBtn = () => `<button class="icone curtir js-curtir" data-acao="curtir-atual" aria-label="Favoritar" aria-pressed="false">${icone('estrela', 'ic-off')}${icone('estrela-cheia', 'ic-on')}</button>`;

export function montarPlayer() {
  $('#mini').innerHTML = `
    <button class="mini-info" data-acao="abrir-cheio" aria-label="Abrir o player">
      <span class="mini-disco">
        <span class="js-disco-mini"></span>
        <svg class="anel" viewBox="0 0 54 54" aria-hidden="true"><circle class="trilho" cx="27" cy="27" r="25" pathLength="100"/><circle class="prog" cx="27" cy="27" r="25" pathLength="100"/></svg>
      </span>
      <span class="mini-txt"><b class="js-titulo"></b><span class="js-artista"></span></span>
    </button>
    ${curtirBtn()}
    <div class="mini-meio">${controles()}${barra()}</div>
    <button class="ctl mini-play js-play" data-acao="alternar" aria-label="Tocar">${icone('play', 'ic-play')}${icone('pause', 'ic-pause')}<span class="roda"></span></button>
    <div class="mini-dir">
      ${curtirBtn()}
      <button class="icone" data-acao="fila" aria-label="Fila de reprodução">${icone('fila')}</button>
      <span class="icone" aria-hidden="true">${icone('volume')}</span>
      <input class="volume-barra" type="range" min="0" max="100" value="100" aria-label="Volume">
    </div>`;

  $('#cheio').innerHTML = `
    <img class="cheio-fundo js-fundo" alt="" hidden>
    ${luzesDoPlayer()}
    <div class="cheio-conteudo">
      <div class="cheio-topo">
        <button class="icone" data-acao="fechar-cheio" aria-label="Fechar o player">${icone('baixo')}</button>
        <span class="etiqueta">Tocando agora</span>
        <button class="icone" data-acao="menu-atual" aria-label="Mais opções">${icone('mais')}</button>
      </div>
      <div class="cheio-capa">
        <div class="palco">
          <span class="js-disco-grande"></span>
          <svg class="braco" viewBox="0 0 120 200" aria-hidden="true"><use href="#i-braco"/></svg>
          <i class="pivo" aria-hidden="true"></i>
          <span class="dica" aria-hidden="true"></span>
        </div>
      </div>
      <div class="cheio-info">
        <div class="cheio-titulo"><b class="js-titulo"></b><div class="js-artista-txt"></div></div>
        ${curtirBtn()}
      </div>
      ${barraOnda()}
      ${controles()}
      <div class="cheio-acoes">
        <button class="icone" data-acao="fila" aria-label="Fila de reprodução">${icone('fila')}</button>
        <button class="icone js-radio" data-acao="radio" aria-label="Rádio infinita" aria-pressed="true">${icone('radio')}</button>
        <button class="icone js-timer" data-acao="timer" aria-label="Timer de sono">${icone('lua')}<span class="selo" hidden></span></button>
        <button class="icone" data-acao="add-atual" aria-label="Adicionar à playlist">${icone('add-lista')}</button>
        <button class="icone" data-acao="compartilhar-atual" aria-label="Compartilhar">${icone('compartilhar')}</button>
      </div>
    </div>`;

  const v = Math.round((store.config().volume ?? 1) * 100);
  $$('.volume-barra').forEach((s) => { s.value = v; s.style.setProperty('--p', v / 100); });

  // girar o disco / arrastar o braço mostra a nova posição e só muda a música ao soltar
  montarVitrola($('.palco'), {
    aoPrevia: (t) => {
      const { d } = player.tempo();
      const p = d ? Math.min(1, t / d) : 0;
      $$('.t-atual').forEach((el) => { el.textContent = fmtTempo(t); });
      $$('.seek').forEach((s) => { s.value = Math.round(p * 1000); s.style.setProperty('--p', p); });
      $$('.seek-linha').forEach((l) => l.style.setProperty('--p', p));
      $('#cheio').style.setProperty('--p', p);
    },
    aoFim: () => pintarTempo(),
  });
}

// ---- pintar a tela conforme o player muda ----
function pintarFaixa() {
  const f = player.atual();
  $('#mini').hidden = !f;
  document.body.classList.toggle('sem-mini', !f);
  document.title = f ? `${f.titulo} · ${f.artista}` : 'Eldev Music';
  if (!f) return;

  const capa = capaDe(f);
  $('.js-disco-mini').innerHTML = discoHtml(capa.replace('480x480', '150x150'), f.id, f.espelhos || []);
  $('.js-disco-grande').innerHTML = discoHtml(capa, f.id, f.espelhos || []);
  const onda = ondaDe(f.id);
  $$('.seek-linha').forEach((l) => l.style.setProperty('--onda', onda));
  const fundo = $('.js-fundo');
  fundo.hidden = !capa;
  if (capa) fundo.src = capa;
  $$('.js-titulo').forEach((el) => { el.textContent = f.titulo; });
  $('.js-artista').textContent = f.artista;
  $('.js-artista-txt').innerHTML = f.src === 'audius' && f.artistaId
    ? `<a href="#/artista/${enc(f.artistaId)}" data-acao="ir-artista">${esc(f.artista)}</a>`
    : `<span>${esc(f.artista)}</span>`;
  pintarCurtida();
  marcarTocando();
}

function pintarEstado() {
  const e = player.estado();
  $$('.js-play').forEach((b) => {
    b.classList.toggle('tocando', e.tocando);
    b.classList.toggle('carregando', e.carregando);
    b.setAttribute('aria-label', e.tocando ? 'Pausar' : 'Tocar');
  });
  document.body.classList.toggle('som', e.tocando);
}

function pintarModo() {
  const e = player.estado();
  $$('.js-emb').forEach((b) => b.setAttribute('aria-pressed', e.embaralhar));
  $$('.js-radio').forEach((b) => {
    b.setAttribute('aria-pressed', e.radio);
    b.setAttribute('aria-label', e.radio ? 'Rádio infinita ligada' : 'Rádio infinita desligada');
  });
  const rot = { off: 'Repetir', todas: 'Repetir tudo', uma: 'Repetir esta música' }[e.repetir];
  $$('.js-rep').forEach((b) => {
    b.dataset.modo = e.repetir;
    b.setAttribute('aria-pressed', e.repetir !== 'off');
    b.setAttribute('aria-label', rot);
  });
}

function pintarCurtida() {
  const f = player.atual();
  const on = !!f && store.curtida(f.id);
  $$('.js-curtir').forEach((b) => {
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Tirar das favoritas' : 'Favoritar');
  });
}

// o botão da lua mostra quanto falta pro timer de sono
function pintarTimer() {
  const t = player.timerAtual();
  let texto = '';
  if (t) texto = t.aoFimDaFaixa ? 'fim' : `${Math.max(1, Math.ceil((t.fim - Date.now()) / 60000))}m`;
  $$('.js-timer').forEach((b) => {
    const selo = b.querySelector('.selo');
    selo.hidden = !t;
    selo.textContent = texto;
    b.setAttribute('aria-pressed', !!t);
    b.setAttribute('aria-label', t ? `Timer de sono: faltam ${texto === 'fim' ? 'até o fim da música' : texto}` : 'Timer de sono');
  });
}

let arrastando = false;

function pintarTempo() {
  if (arrastando || girando()) return;
  const { t, d } = player.tempo();
  const p = d ? Math.min(1, t / d) : 0;
  $$('.seek').forEach((s) => {
    s.value = Math.round(p * 1000);
    s.style.setProperty('--p', p);
    s.setAttribute('aria-valuetext', `${fmtTempo(t)} de ${fmtTempo(d)}`);
  });
  $$('.t-atual').forEach((el) => { el.textContent = fmtTempo(t); });
  $$('.t-total').forEach((el) => { el.textContent = fmtTempo(d); });
  $$('.seek-linha').forEach((l) => l.style.setProperty('--p', p));
  $('#mini').style.setProperty('--p', p);
  $('#cheio').style.setProperty('--p', p); // o braço da vitrola anda conforme a música toca
}

// destaca (com as barrinhas) a música que está tocando em qualquer lista da tela
export function marcarTocando() {
  const id = player.atual()?.id;
  $$('[data-id]').forEach((el) => {
    el.classList.toggle('tocando', !!id && el.dataset.id === id);
    el.classList.toggle('baixada', store.estaBaixadaId(el.dataset.id)); // ✓ nas músicas que já estão no aparelho
  });
}

let quadro = 0;
new MutationObserver(() => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(marcarTocando);
}).observe($('#tela'), { childList: true, subtree: true });

player.on('faixa', pintarFaixa);
player.on('estado', pintarEstado);
player.on('modo', pintarModo);
player.on('tempo', pintarTempo);
player.on('timer', pintarTimer);
player.on('aviso', avisar);
player.on('erro', (f) => avisar(f ? `Não deu pra tocar “${f.titulo}”` : 'Não deu pra tocar essa música'));
store.ouvir((t) => {
  if (t === 'curtidas') pintarCurtida();
  if (t === 'baixadas') { marcarTocando(); atualizarBotoes(); }
});

// barra de posição e de volume
document.addEventListener('input', (e) => {
  if (e.target.matches?.('.seek')) {
    arrastando = true;
    const p = e.target.value / 1000;
    const { d } = player.tempo();
    $$('.seek').forEach((s) => { s.value = e.target.value; s.style.setProperty('--p', p); });
    $$('.seek-linha').forEach((l) => l.style.setProperty('--p', p));
    $$('.t-atual').forEach((el) => { el.textContent = fmtTempo(p * d); });
  } else if (e.target.matches?.('.volume-barra')) {
    const v = e.target.value / 100;
    player.definirVolume(v);
    $$('.volume-barra').forEach((s) => { s.value = e.target.value; s.style.setProperty('--p', v); });
  }
});
document.addEventListener('change', (e) => {
  if (!e.target.matches?.('.seek')) return;
  const { d } = player.tempo();
  player.buscarTempo((e.target.value / 1000) * d);
  arrastando = false;
  pintarTempo();
});

// teclado do computador: espaço toca/pausa, setas andam 5 segundos
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.('input, textarea, select, button, a, dialog, [contenteditable]')) return;
  if (e.key === ' ') { e.preventDefault(); player.alternar(); }
  else if (e.key === 'ArrowRight') player.buscarTempo(player.tempo().t + 5);
  else if (e.key === 'ArrowLeft') player.buscarTempo(player.tempo().t - 5);
});

// ---- tela cheia ----
function ocultarCheio() {
  const c = $('#cheio');
  c.classList.remove('aberto');
  document.body.classList.remove('tela-cheia');
  c.inert = true;
  $('.mini-info')?.focus({ preventScroll: true });
}

function abrirCheio() {
  const c = $('#cheio');
  if (!player.atual() || c.classList.contains('aberto')) return;
  c.inert = false;
  c.classList.add('aberto');
  document.body.classList.add('tela-cheia');
  abrirCamada(ocultarCheio);
  c.querySelector('[data-acao="fechar-cheio"]').focus({ preventScroll: true });
}

export const acoesPlayer = {
  alternar: () => player.alternar(),
  proxima: () => player.proxima(),
  anterior: () => player.anterior(),
  embaralhar: () => player.alternarEmbaralhar(),
  repetir: () => player.alternarRepetir(),
  radio: () => {
    player.alternarRadio();
    avisar(player.estado().radio ? 'Rádio ligada: quando a lista acabar, continua com músicas parecidas' : 'Rádio desligada: o som para quando a lista acabar');
  },
  timer: abrirTimer,
  'abrir-cheio': abrirCheio,
  'fechar-cheio': fecharCamada,
  'curtir-atual': () => {
    const f = player.atual();
    if (!f) return;
    avisar(store.alternarCurtida(f) ? 'Adicionada às Favoritas' : 'Removida das Favoritas');
  },
  fila: abrirFila,
  'add-atual': () => { const f = player.atual(); if (f) escolherPlaylist(f); },
  'menu-atual': () => { const f = player.atual(); if (f) menuFaixa(f); },
  'compartilhar-atual': () => { const f = player.atual(); if (f) compartilhar(f); },
  'ir-artista': (el) => navegar(el.getAttribute('href')),
};
