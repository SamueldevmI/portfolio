// Luzes lá atrás: manchas de luz que passeiam devagar, com as cores da capa e no ritmo (BPM) da música.
// Dão profundidade: as grandes ficam longe (lentas, macias), as pequenas perto, e ao mexer o mouse ou inclinar
// o celular cada camada anda uma quantidade diferente (parallax). O vidro fosco do menu e do player desfoca essa luz.
import * as player from './player.js';
import * as store from './store.js';
import { paletaDaCapa } from './cores.js';

const NIVEIS = ['completo', 'suave', 'desligado'];
const reduzido = matchMedia('(prefers-reduced-motion: reduce)');

// as duas últimas luzes ("extra") somem no nível Suave
const LUZES = '<div class="luz-pulso"><i class="luz"></i><i class="luz"></i><i class="luz"></i><i class="luz extra"></i><i class="luz extra"></i></div>';

// o que fica dentro do player em tela cheia: as luzes e o facho de palco
export const luzesDoPlayer = () => `<div class="luzes luzes-cheio" aria-hidden="true">${LUZES}</div><div class="facho" aria-hidden="true"></div>`;

export const nivel = () => (NIVEIS.includes(store.config().efeitos) ? store.config().efeitos : 'completo');
const completo = () => document.body.dataset.efeitos === 'completo' && !reduzido.matches;

export function aplicarNivel(n = nivel()) {
  document.body.dataset.efeitos = NIVEIS.includes(n) ? n : 'completo';
  ligarSensores();
}

// ---------- cores da capa ----------
function aplicarPaleta(p) {
  for (const el of document.querySelectorAll('.luzes')) {
    ['--luz-a', '--luz-b', '--luz-c'].forEach((k, i) => (p ? el.style.setProperty(k, p[i]) : el.style.removeProperty(k)));
  }
}

// ---------- batida: as luzes "respiram" no tempo da música ----------
let periodo = 0; // segundos entre as batidas (0 = música sem BPM conhecido)
let ultimoAlinhamento = 0;
let ultimoTempo = 0;

function ajustarBatida(f) {
  let p = f.bpm >= 50 && f.bpm <= 220 ? 60 / f.bpm : 0;
  while (p && p < 0.45) p *= 2; // música muito rápida: pulsa na metade do tempo, pra não virar strobo
  periodo = p;
  for (const el of document.querySelectorAll('.luzes')) el.style.setProperty('--batida', `${p || 3.2}s`);
  alinharBatida(true);
}

// põe a animação na mesma posição da música: se a faixa começa na batida, a luz bate junto
function alinharBatida(forcar) {
  if (!periodo || !completo()) return;
  const agora = performance.now();
  if (!forcar && agora - ultimoAlinhamento < 2500) return;
  ultimoAlinhamento = agora;
  const fase = (player.tempo().t % periodo) * 1000;
  for (const el of document.querySelectorAll('.luz-pulso')) {
    for (const a of el.getAnimations()) if (a.animationName === 'bater') a.currentTime = fase;
  }
}

// ---------- parallax: mouse no computador, inclinação no celular Android ----------
let alvoX = 0;
let alvoY = 0;
let x = 0;
let y = 0;
let quadro = 0;

function passo() {
  x += (alvoX - x) * 0.14;
  y += (alvoY - y) * 0.14;
  const vx = x.toFixed(3);
  const vy = y.toFixed(3);
  // escreve só nestes dois elementos (escrever na página inteira deixaria a rolagem pesada)
  for (const el of [document.getElementById('luzes'), document.getElementById('cheio')]) {
    el?.style.setProperty('--px', vx);
    el?.style.setProperty('--py', vy);
  }
  quadro = Math.abs(alvoX - x) > 0.003 || Math.abs(alvoY - y) > 0.003 ? requestAnimationFrame(passo) : 0;
}

function mover(nx, ny) {
  alvoX = nx;
  alvoY = ny;
  if (!quadro) quadro = requestAnimationFrame(passo);
}

const limitar = (v) => Math.max(-1, Math.min(1, v));
const aoMouse = (e) => { if (e.pointerType === 'mouse') mover(limitar((e.clientX / innerWidth - 0.5) * 2), limitar((e.clientY / innerHeight - 0.5) * 2)); };
// celular segurado de pé fica em ~45° de inclinação; no iPhone o evento só vem com permissão, então lá não faz nada
const aoInclinar = (e) => { if (e.gamma != null) mover(limitar(e.gamma / 22), limitar(((e.beta ?? 45) - 45) / 22)); };

let ligado = false;
function ligarSensores() {
  const quer = completo() && document.visibilityState === 'visible';
  if (quer === ligado) return;
  ligado = quer;
  if (quer) {
    addEventListener('pointermove', aoMouse, { passive: true });
    addEventListener('deviceorientation', aoInclinar, { passive: true });
  } else {
    removeEventListener('pointermove', aoMouse);
    removeEventListener('deviceorientation', aoInclinar);
    mover(0, 0);
  }
}

export function iniciarLuzes() {
  const raiz = document.createElement('div');
  raiz.id = 'luzes';
  raiz.className = 'luzes';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = LUZES;
  document.body.prepend(raiz);
  aplicarNivel();

  reduzido.addEventListener?.('change', ligarSensores);
  document.addEventListener('visibilitychange', ligarSensores);
  store.ouvir((t) => { if (t === 'config') aplicarNivel(); });

  player.on('faixa', async (f) => {
    if (!f) { aplicarPaleta(null); return; }
    ajustarBatida(f);
    const paleta = await paletaDaCapa(f);
    if (player.atual()?.id === f.id) aplicarPaleta(paleta);
  });
  player.on('estado', () => { if (player.estado().tocando) alinharBatida(true); });
  player.on('tempo', () => {
    const t = player.tempo().t;
    const pulou = Math.abs(t - ultimoTempo) > 1.5; // a pessoa mexeu na barra: alinha na hora
    ultimoTempo = t;
    alinharBatida(pulou);
  });
}
