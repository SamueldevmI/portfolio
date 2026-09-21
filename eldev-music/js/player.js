// Motor de reprodução: um <audio> só, a fila, aleatório, repetir e os controles da tela de bloqueio.
import * as store from './store.js';
import { lerArquivo, capaDe } from './db.js';
import { urlDeStream } from './audius.js';
import { embaralhar } from './util.js';

const audio = new Audio();
audio.preload = 'auto';
audio.volume = store.config().volume ?? 1;

const E = {
  original: [],    // a lista como veio da tela
  lista: [],       // a ordem que vai tocar (igual à original, ou misturada)
  indice: -1,
  embaralhar: false,
  repetir: 'off',  // 'off' | 'todas' | 'uma'
  tocando: false,
  carregando: false,
  pendente: 0,     // segundos onde parou (fila restaurada, ainda sem áudio carregado)
  radio: store.config().radio !== false, // rádio infinita: quando a lista acaba, continua com músicas parecidas
};

let seq = 0;            // número da última troca de faixa: respostas atrasadas de faixas antigas são ignoradas
let erros = 0;          // erros seguidos, pra não pular a fila inteira quando a internet cai
let urlLocal = '';
let registrada = -1;    // troca que já foi lançada em "tocadas recentemente"
let carregada = false;  // o <audio> já está com a faixa atual?
let ultimoSalvo = 0;

const ouvintes = {};
export const on = (ev, fn) => { (ouvintes[ev] ??= new Set()).add(fn); };
const emit = (ev, ...a) => ouvintes[ev]?.forEach((f) => f(...a));

export const estado = () => E;
export const atual = () => E.lista[E.indice] || null;

export function tempo() {
  const d = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : atual()?.duracao || 0;
  return { t: carregada ? audio.currentTime : E.pendente, d };
}

function soltarUrl() {
  if (urlLocal) URL.revokeObjectURL(urlLocal);
  urlLocal = '';
}

// ---- rádio infinita: quando a lista está acabando, pede músicas parecidas e põe no fim da fila ----
let provedorRadio = null;
let buscandoRadio = null;
export const definirRadio = (fn) => { provedorRadio = fn; };

function garantirRadio() {
  if (!E.radio || !provedorRadio || E.repetir === 'todas') return null;
  if (buscandoRadio) return buscandoRadio;
  const semente = atual() || E.lista[E.lista.length - 1];
  if (!semente) return null;
  const evitar = new Set(E.lista.map((f) => f.id));
  store.recentes().forEach((f) => evitar.add(f.id));
  buscandoRadio = (async () => {
    try {
      const novas = await provedorRadio({ semente, evitar });
      if (!novas.length) return;
      const marcadas = novas.map((f) => ({ ...f, radio: true }));
      E.lista.push(...marcadas);
      E.original.push(...marcadas);
      emit('fila');
      guardar();
    } catch {
      /* sem internet: a fila acaba normalmente */
    } finally {
      buscandoRadio = null;
    }
  })();
  return buscandoRadio;
}

// sem internet só tocam os arquivos do aparelho e as músicas baixadas
const tocaSemInternet = (f) => f.src === 'local' || store.estaBaixadaId(f.id);

async function carregar(i, { tocar = true, de = 0 } = {}) {
  if (i < 0 || i >= E.lista.length) return;
  const meu = ++seq;
  E.indice = i;
  E.pendente = de;
  E.carregando = tocar;
  carregada = false;
  const f = E.lista[i];
  if (timer?.aoFimDaFaixa && timer.faixaId !== f.id) encerrarTimer(false); // "ao fim desta música" valia só pra aquela
  emit('faixa', f);
  emit('estado');
  sessao(f);
  if (E.lista.length - 1 - i <= 2) garantirRadio();

  let url;
  try {
    // arquivo do aparelho ou música baixada: toca do próprio aparelho; senão, direto do Audius
    const guardada = f.src === 'local' || store.estaBaixadaId(f.id) ? await lerArquivo(f.src === 'local' ? f.ref : f.id).catch(() => null) : null;
    if (meu !== seq) return;
    if (guardada) {
      soltarUrl();
      urlLocal = URL.createObjectURL(guardada);
      url = urlLocal;
    } else if (f.src === 'local') {
      throw new Error('arquivo não encontrado');
    } else {
      url = urlDeStream(f.ref);
    }
  } catch {
    return falhou(meu);
  }

  audio.src = url;
  carregada = true;
  if (de) audio.currentTime = de;
  E.pendente = 0;
  guardar();

  if (!tocar) {
    E.carregando = false;
    emit('estado');
    return;
  }
  try {
    await audio.play();
  } catch (e) {
    if (meu !== seq || e.name === 'AbortError') return;
    E.carregando = false;
    E.tocando = false;
    emit('estado');
    if (e.name !== 'NotAllowedError') falhou(meu);
  }
}

function falhou(meu) {
  if (meu !== seq) return;
  erros++;
  E.carregando = false;
  emit('erro', atual());
  if (erros < 3 && E.lista.length > 1) {
    setTimeout(() => { if (meu === seq) avancar(true); }, 600);
  } else {
    E.tocando = false;
    erros = 0;
    emit('estado');
  }
}

async function avancar(manual) {
  if (!E.lista.length) return;
  if (!manual && E.repetir === 'uma') {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return;
  }
  let i = E.indice + 1;
  // acabou a lista: com a rádio ligada, espera as músicas parecidas chegarem e segue
  if (i >= E.lista.length) await garantirRadio();
  if (i >= E.lista.length) {
    if (E.repetir === 'todas' || manual) i = 0;
    else {
      // acabou a lista: volta pra primeira, parada
      E.tocando = false;
      carregar(0, { tocar: false });
      return;
    }
  }
  // sem internet, pula o que não tem como tocar
  if (!navigator.onLine) {
    const j = E.lista.findIndex((f, k) => k >= i && tocaSemInternet(f));
    const alvo = j >= 0 ? j : E.lista.findIndex(tocaSemInternet);
    if (alvo < 0) {
      audio.pause();
      emit('aviso', 'Sem internet e nenhuma música baixada nesta fila');
      return;
    }
    i = alvo;
  }
  carregar(i, { tocar: true });
}

// ---- eventos do <audio> ----
audio.addEventListener('playing', () => {
  E.tocando = true;
  E.carregando = false;
  erros = 0;
  if (registrada !== seq) {
    registrada = seq;
    const f = atual();
    if (f) store.registrarRecente(f);
  }
  emit('estado');
  estadoSessao('playing');
});
audio.addEventListener('pause', () => {
  if (audio.ended) return;
  E.tocando = false;
  E.carregando = false;
  emit('estado');
  estadoSessao('paused');
  guardar();
});
audio.addEventListener('waiting', () => {
  if (!audio.paused) { E.carregando = true; emit('estado'); }
});
audio.addEventListener('canplay', () => {
  if (E.carregando) { E.carregando = false; emit('estado'); }
});
audio.addEventListener('timeupdate', () => {
  emit('tempo');
  posicaoSessao();
  guardar(false);
});
audio.addEventListener('durationchange', () => emit('tempo'));
audio.addEventListener('ended', () => {
  if (timer?.aoFimDaFaixa) {
    // timer "ao fim desta música": não segue pra próxima
    E.tocando = false;
    emit('estado');
    estadoSessao('paused');
    encerrarTimer(false);
    emit('aviso', 'Timer de sono: música pausada. Boa noite!');
    return;
  }
  avancar(false);
});
audio.addEventListener('error', () => { if (audio.getAttribute('src')) falhou(seq); });

// ---- controles ----
export function tocarLista(lista, indice = 0, { misturar } = {}) {
  if (!lista.length) return;
  E.original = lista.slice(0, 300);
  indice = Math.min(indice, E.original.length - 1);
  if (misturar !== undefined) E.embaralhar = misturar;
  if (E.embaralhar) {
    if (misturar === true) indice = Math.floor(Math.random() * E.original.length);
    E.lista = [E.original[indice], ...embaralhar(E.original.filter((_, k) => k !== indice))];
    indice = 0;
  } else {
    E.lista = [...E.original];
  }
  emit('fila');
  emit('modo');
  carregar(indice, { tocar: true });
}

export function tocarAgora() {
  if (!atual()) return;
  if (!carregada) { carregar(E.indice, { tocar: true, de: E.pendente }); return; }
  audio.play().catch(() => {});
}

export const pausar = () => audio.pause();

export function alternar() {
  if (!atual()) return;
  if (E.tocando || (E.carregando && !audio.paused)) pausar();
  else tocarAgora();
}

export const proxima = () => avancar(true);

export function anterior() {
  if (!E.lista.length) return;
  if (carregada && audio.currentTime > 3) { audio.currentTime = 0; return; }
  let i = E.indice - 1;
  if (i < 0) i = E.repetir === 'todas' ? E.lista.length - 1 : 0;
  carregar(i, { tocar: true });
}

export function buscarTempo(s) {
  const { d } = tempo();
  s = Math.max(0, d ? Math.min(s, d - 0.5) : s);
  if (!carregada) { E.pendente = s; emit('tempo'); return; }
  audio.currentTime = s;
}

export const irPara = (i) => carregar(i, { tocar: true });

export function alternarEmbaralhar() {
  E.embaralhar = !E.embaralhar;
  const f = atual();
  if (f) {
    const pos = E.original.findIndex((x) => x.id === f.id);
    if (E.embaralhar) {
      E.lista = [f, ...embaralhar(E.original.filter((_, k) => k !== pos))];
      E.indice = 0;
    } else {
      E.lista = [...E.original];
      E.indice = Math.max(0, pos);
    }
  }
  emit('fila');
  emit('modo');
  guardar();
}

export function alternarRepetir() {
  E.repetir = { off: 'todas', todas: 'uma', uma: 'off' }[E.repetir];
  emit('modo');
  guardar();
}

export function tocarEmSeguida(f) {
  if (!atual()) return tocarLista([f]);
  E.lista.splice(E.indice + 1, 0, f);
  E.original.splice(E.original.findIndex((x) => x.id === atual().id) + 1, 0, f);
  emit('fila');
  guardar();
}

export function adicionarNaFila(f) {
  if (!atual()) return tocarLista([f]);
  E.lista.push(f);
  E.original.push(f);
  emit('fila');
  guardar();
}

export function removerDaFila(i) {
  if (i === E.indice || i < 0 || i >= E.lista.length) return;
  const [f] = E.lista.splice(i, 1);
  if (i < E.indice) E.indice--;
  const k = E.original.findIndex((x) => x.id === f.id);
  if (k >= 0) E.original.splice(k, 1);
  emit('fila');
  guardar();
}

// se a faixa que estava tocando foi apagada do aparelho
export function esquecer(id) {
  E.lista = E.lista.filter((f) => f.id !== id);
  E.original = E.original.filter((f) => f.id !== id);
  if (atual()?.id === id || E.indice >= E.lista.length) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    carregada = false;
    E.tocando = false;
    E.indice = E.lista.length ? Math.min(E.indice, E.lista.length - 1) : -1;
    seq++;
    emit('faixa', atual());
    emit('estado');
  }
  emit('fila');
  guardar();
}

export function definirVolume(v) {
  audio.volume = Math.min(1, Math.max(0, v));
  store.definirConfig({ volume: audio.volume });
}

export function alternarRadio() {
  E.radio = !E.radio;
  store.definirConfig({ radio: E.radio });
  emit('modo');
  if (E.radio) garantirRadio();
}

// ---- timer de sono: pausa sozinho, com o volume descendo nos últimos 15 segundos ----
const FADE = 15;
let timer = null; // { opcao, fim (hora em ms) ou null, aoFimDaFaixa, faixaId, relogio }

export const timerAtual = () => (timer ? { opcao: timer.opcao, fim: timer.fim, aoFimDaFaixa: timer.aoFimDaFaixa } : null);

// quando: minutos (número), 'fim' (ao fim desta música) ou 0 (desligar)
export function definirTimer(quando) {
  encerrarTimer(false);
  if (quando) {
    timer = quando === 'fim'
      ? { opcao: 'fim', fim: null, aoFimDaFaixa: true, faixaId: atual()?.id || '' }
      : { opcao: quando, fim: Date.now() + quando * 60000, aoFimDaFaixa: false };
    timer.relogio = setInterval(tiqueDoTimer, 1000);
  }
  emit('timer');
}

function tiqueDoTimer() {
  if (!timer) return;
  if (timer.fim) {
    const resta = (timer.fim - Date.now()) / 1000;
    if (resta <= 0) {
      encerrarTimer(true);
      emit('aviso', 'Timer de sono: música pausada. Boa noite!');
      return;
    }
    if (resta <= FADE) audio.volume = Math.max(0, (store.config().volume ?? 1) * (resta / FADE));
  }
  emit('timer');
}

function encerrarTimer(pausar) {
  if (!timer) return;
  clearInterval(timer.relogio);
  timer = null;
  if (pausar) audio.pause();
  audio.volume = store.config().volume ?? 1; // devolve o volume de antes
  emit('timer');
}

// ---- lembrar onde parou ----
function guardar(forcar = true) {
  if (!E.lista.length) return;
  if (!forcar && Date.now() - ultimoSalvo < 5000) return;
  ultimoSalvo = Date.now();
  store.guardarFila({
    original: E.original, lista: E.lista, indice: E.indice,
    tempo: Math.floor(carregada ? audio.currentTime : E.pendente),
    embaralhar: E.embaralhar, repetir: E.repetir,
  });
}

export function restaurar() {
  const s = store.fila();
  if (!s?.lista?.length) return;
  E.lista = s.lista;
  E.original = s.original?.length ? s.original : s.lista;
  E.indice = Math.min(s.indice ?? 0, s.lista.length - 1);
  E.embaralhar = !!s.embaralhar;
  E.repetir = s.repetir || 'off';
  E.pendente = s.tempo || 0;
  carregada = false;
  emit('faixa', atual());
  emit('estado');
  emit('fila');
  emit('modo');
  emit('tempo');
  sessao(atual());
}

// ---- controles do celular (tela de bloqueio, fone, teclas de mídia do computador) ----
const temSessao = 'mediaSession' in navigator;

function sessao(f) {
  if (!temSessao || !f) return;
  const capa = capaDe(f);
  navigator.mediaSession.metadata = new MediaMetadata({
    title: f.titulo,
    artist: f.artista,
    album: f.src === 'audius' ? 'Audius' : 'Meus arquivos',
    artwork: capa
      ? [{ src: capa, sizes: '480x480' }]
      : [{ src: new URL('icons/icon-512.png', location.href).href, sizes: '512x512', type: 'image/png' }],
  });
}

function estadoSessao(s) {
  if (temSessao) navigator.mediaSession.playbackState = s;
}

let ultimaPosicao = 0;
function posicaoSessao() {
  if (!temSessao || Date.now() - ultimaPosicao < 1000) return;
  ultimaPosicao = Date.now();
  const d = audio.duration;
  if (!Number.isFinite(d) || d <= 0) return;
  try {
    navigator.mediaSession.setPositionState({ duration: d, position: Math.min(audio.currentTime, d), playbackRate: audio.playbackRate || 1 });
  } catch { /* alguns navegadores não aceitam */ }
}

if (temSessao) {
  const acao = (nome, fn) => { try { navigator.mediaSession.setActionHandler(nome, fn); } catch { /* sem suporte */ } };
  acao('play', tocarAgora);
  acao('pause', pausar);
  acao('stop', pausar);
  acao('previoustrack', anterior);
  acao('nexttrack', proxima);
  acao('seekto', (d) => buscarTempo(d.seekTime));
  acao('seekbackward', (d) => buscarTempo(audio.currentTime - (d.seekOffset || 10)));
  acao('seekforward', (d) => buscarTempo(audio.currentTime + (d.seekOffset || 10)));
}
