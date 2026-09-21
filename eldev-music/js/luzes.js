// Luzes lá atrás: manchas de luz que passeiam pelo fundo com as cores da capa que está tocando.
// Dão profundidade: as grandes ficam longe (lentas, macias), as pequenas perto (rápidas), e cada camada anda uma
// quantidade diferente quando você mexe o mouse, inclina o celular, rola a lista ou troca de tela (parallax).
// A batida da música NÃO mexe no brilho (nada de piscar): ela só controla a velocidade do passeio.
// Quem gostar pode ligar "Piscar na batida" em Configurações. O vidro fosco do menu e do player desfoca essa luz.
import * as player from './player.js';
import * as store from './store.js';
import { paletaDaCapa } from './cores.js';

const NIVEIS = ['completo', 'suave', 'desligado'];
const reduzido = matchMedia('(prefers-reduced-motion: reduce)');

// Cada luz tem 3 camadas: .luz (parallax) > .lx (vai e volta na horizontal) > .ly (vai e volta na vertical).
// Os dois vai-e-volta têm tempos diferentes, então o trajeto é uma curva que quase nunca se repete.
// O atraso negativo sorteado faz cada visita começar com as luzes em lugares diferentes.
// As duas últimas luzes ("extra") somem no nível Suave.
const sorteio = () => `-${(Math.random() * 60).toFixed(1)}s`;
const luz = (extra = '') => `<i class="luz${extra}" style="--ix:${sorteio()};--iy:${sorteio()}"><b class="lx"><b class="ly"></b></b></i>`;
const luzesHtml = () => `<div class="luz-pulso">${luz()}${luz()}${luz()}${luz(' extra')}${luz(' extra')}</div>`;

// o que fica dentro do player em tela cheia: as luzes e o facho de palco
export const luzesDoPlayer = () => `<div class="luzes luzes-cheio" aria-hidden="true">${luzesHtml()}</div><div class="facho" aria-hidden="true"></div>`;

export const nivel = () => (NIVEIS.includes(store.config().efeitos) ? store.config().efeitos : 'completo');
export const piscar = () => store.config().piscar === true;
const completo = () => document.body.dataset.efeitos === 'completo' && !reduzido.matches;
const raiz = () => document.getElementById('luzes');
const raizes = () => [document.getElementById('luzes'), document.getElementById('cheio')];

export function aplicarNivel(n = nivel(), p = piscar()) {
  const lvl = NIVEIS.includes(n) ? n : 'completo';
  document.body.dataset.efeitos = lvl;
  document.body.dataset.piscar = p && lvl === 'completo' ? 'sim' : 'nao';
  ligarSensores();
  aplicarVelocidade();
  alinharBatida(true);
}

// ---------- cores da capa ----------
function aplicarPaleta(p) {
  for (const el of document.querySelectorAll('.luzes')) {
    ['--luz-a', '--luz-b', '--luz-c'].forEach((k, i) => (p ? el.style.setProperty(k, p[i]) : el.style.removeProperty(k)));
  }
}

// ---------- velocidade: música rápida deixa as luzes mais ligeiras ----------
let taxa = 1; // velocidade de agora (1 = a normal)
let taxaAlvo = 1; // velocidade que a música pede
let rampa = 0;
const taxaDe = (f) => (f?.bpm >= 50 && f.bpm <= 220 ? Math.min(1.6, Math.max(0.75, f.bpm / 100)) : 1);

function aplicarVelocidade() {
  for (const el of document.querySelectorAll('.luzes')) {
    for (const a of el.getAnimations({ subtree: true })) if (a.animationName?.startsWith('vagar-')) a.playbackRate = taxa;
  }
}

// muda aos poucos (uns 1,5 s), sem tranco, quando a música troca
function mudarVelocidade(alvo) {
  taxaAlvo = alvo;
  cancelAnimationFrame(rampa);
  const passo = () => {
    taxa = Math.abs(taxaAlvo - taxa) < 0.005 ? taxaAlvo : taxa + (taxaAlvo - taxa) * 0.05;
    aplicarVelocidade();
    if (taxa !== taxaAlvo) rampa = requestAnimationFrame(passo);
  };
  rampa = requestAnimationFrame(passo);
}

// ---------- (opcional) piscar na batida ----------
let periodo = 0; // segundos entre as batidas (0 = música sem BPM conhecido)
let ultimoAlinhamento = 0;
let ultimoTempo = 0;

function ajustarMusica(f) {
  let p = f.bpm >= 50 && f.bpm <= 220 ? 60 / f.bpm : 0;
  while (p && p < 0.45) p *= 2; // música muito rápida: pulsa na metade do tempo, pra não virar strobo
  periodo = p;
  for (const el of document.querySelectorAll('.luzes')) el.style.setProperty('--batida', `${p || 3.2}s`);
  mudarVelocidade(taxaDe(f));
  alinharBatida(true);
}

// põe a animação na mesma posição da música: se a faixa começa na batida, a luz bate junto (só com "Piscar na batida")
function alinharBatida(forcar) {
  if (!periodo || !completo() || document.body.dataset.piscar !== 'sim') return;
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
  for (const el of raizes()) {
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

// ---------- rolagem: as luzes andam mais devagar que a lista (as de perto mais que as de longe) ----------
// a página inteira, de cima até embaixo, vira um trajeto fixo das luzes (0 a 1)
let quadroRolagem = 0;
function aoRolar() {
  if (quadroRolagem) return;
  quadroRolagem = requestAnimationFrame(() => {
    quadroRolagem = 0;
    const sobra = document.documentElement.scrollHeight - innerHeight;
    raiz()?.style.setProperty('--sy', (sobra > 0 ? Math.min(1, Math.max(0, scrollY / sobra)) : 0).toFixed(3));
  });
}

// ---------- troca de tela e de música empurram as luzes ----------
const ABAS = { inicio: 0, buscar: 1, biblioteca: 2 };
let aba = 0; // 0, 1 ou 2: cada aba deixa as luzes um pouco mais pro lado
let lado = 0; // a cada música nova as luzes escorregam pro lado oposto do último empurrão (1 ou -1)

function aplicarEmpurroes(ligar) {
  const r = raiz();
  if (ligar) {
    r?.style.setProperty('--rota', aba);
    for (const el of raizes()) el?.style.setProperty('--vai', lado);
  } else {
    r?.style.removeProperty('--rota');
    r?.style.removeProperty('--sy');
    for (const el of raizes()) el?.style.removeProperty('--vai');
  }
}

export function definirAba(nome) {
  aba = ABAS[nome] ?? 0;
  if (ligado) aplicarEmpurroes(true);
}

// tudo isso só vale no nível Completo, com a aba visível e sem "reduzir movimento"
let ligado = false;
function ligarSensores() {
  const quer = completo() && document.visibilityState === 'visible';
  if (quer === ligado) return;
  ligado = quer;
  if (quer) {
    addEventListener('pointermove', aoMouse, { passive: true });
    addEventListener('deviceorientation', aoInclinar, { passive: true });
    addEventListener('scroll', aoRolar, { passive: true });
    aplicarEmpurroes(true);
    aoRolar();
  } else {
    removeEventListener('pointermove', aoMouse);
    removeEventListener('deviceorientation', aoInclinar);
    removeEventListener('scroll', aoRolar);
    mover(0, 0);
    aplicarEmpurroes(false);
  }
}

export function iniciarLuzes() {
  const r = document.createElement('div');
  r.id = 'luzes';
  r.className = 'luzes';
  r.setAttribute('aria-hidden', 'true');
  r.innerHTML = luzesHtml();
  document.body.prepend(r);
  aplicarNivel();

  reduzido.addEventListener?.('change', () => { ligarSensores(); aplicarVelocidade(); });
  document.addEventListener('visibilitychange', ligarSensores);
  store.ouvir((t) => { if (t === 'config') aplicarNivel(); });

  let ultima = null; // id da última música (a primeira, ao abrir o app, não empurra nada)
  player.on('faixa', async (f) => {
    if (!f) { aplicarPaleta(null); return; }
    ajustarMusica(f);
    if (ultima !== null && ultima !== f.id) {
      lado = lado === 1 ? -1 : 1;
      if (ligado) aplicarEmpurroes(true);
    }
    ultima = f.id;
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
