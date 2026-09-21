// A vitrola: girar o disco com o dedo avança/volta a música; arrastar o braço escolhe o ponto da faixa.
// Um toque no disco (sem arrastar) toca ou pausa.
import * as player from './player.js';
import * as store from './store.js';
import { fmtTempo } from './util.js';

const SEGUNDOS_POR_VOLTA = 30; // uma volta inteira no disco = 30 segundos de música
const ARCO = 18;               // o braço anda de -18° (começo da música) a +18° (fim)
const ANGULO_BASE = 114.25;    // direção do braço sem rotação (graus, do pivô até a agulha, conforme o desenho)
const TEXTO_DICA = 'Gire o disco pra avançar ou voltar';

let ativo = false;
export const girando = () => ativo;

const graus = (rad) => (rad * 180) / Math.PI;
const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
function normalizar(a) {
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

export function montarVitrola(palco, { aoPrevia, aoFim }) {
  const dica = palco.querySelector('.dica');
  dica.textContent = TEXTO_DICA;
  dica.hidden = !store.config().dicaDisco;

  let modo = null;
  let idPonteiro = null;
  let cx = 0; let cy = 0; let px = 0; let py = 0;
  let angAnt = 0; let acumulado = 0;
  let tempoIni = 0; let duracao = 0; let previsto = 0;
  let giro = 0; let giroIni = 0;
  let xIni = 0; let yIni = 0; let movido = 0; let t0 = 0; let ultimoTique = -1;

  palco.addEventListener('pointerdown', (e) => {
    if (ativo || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const { t, d } = player.tempo();
    const disco = palco.querySelector('.disco');
    if (!d || !disco) return;
    const r = disco.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    const noBraco = !!e.target.closest?.('.braco');
    const dentro = Math.hypot(e.clientX - cx, e.clientY - cy) <= r.width / 2;
    if (!noBraco && !dentro) return;

    modo = noBraco ? 'braco' : 'disco';
    idPonteiro = e.pointerId;
    try { palco.setPointerCapture(e.pointerId); } catch { /* alguns ponteiros não deixam; o arrasto funciona igual */ }
    ativo = true;
    palco.classList.add('arrastando');
    duracao = d;
    tempoIni = t;
    previsto = t;
    acumulado = 0;
    giroIni = giro;
    xIni = e.clientX;
    yIni = e.clientY;
    movido = 0;
    t0 = Date.now();
    ultimoTique = Math.floor(t / 5);
    angAnt = graus(Math.atan2(e.clientY - cy, e.clientX - cx));
    if (modo === 'braco') {
      const pivo = palco.querySelector('.pivo').getBoundingClientRect();
      px = pivo.left + pivo.width / 2;
      py = pivo.top + pivo.height / 2;
    }
    e.preventDefault();
  });

  palco.addEventListener('pointermove', (e) => {
    if (!ativo || e.pointerId !== idPonteiro) return;
    movido = Math.max(movido, Math.hypot(e.clientX - xIni, e.clientY - yIni));
    const fim = Math.max(0, duracao - 0.5);

    if (modo === 'disco') {
      const ang = graus(Math.atan2(e.clientY - cy, e.clientX - cx));
      acumulado += normalizar(ang - angAnt);
      angAnt = ang;
      giro = giroIni + acumulado;
      palco.style.setProperty('--giro', `${giro}deg`);
      previsto = limitar(tempoIni + (acumulado / 360) * SEGUNDOS_POR_VOLTA, 0, fim);
    } else {
      const a = graus(Math.atan2(e.clientY - py, e.clientX - px));
      const theta = limitar(normalizar(a - ANGULO_BASE), -ARCO, ARCO);
      palco.style.setProperty('--braco-ang', `${theta}deg`);
      previsto = ((theta + ARCO) / (2 * ARCO)) * fim;
    }

    if (movido < 6) return;
    aoPrevia(previsto);
    const delta = previsto - tempoIni;
    dica.textContent = `${fmtTempo(previsto)}  (${delta < 0 ? '−' : '+'}${fmtTempo(Math.abs(delta))})`;
    dica.hidden = false;
    const tique = Math.floor(previsto / 5);
    if (tique !== ultimoTique) {
      ultimoTique = tique;
      navigator.vibrate?.(3); // um "clique" de leve no celular a cada 5 segundos
    }
  });

  const terminar = (cancelado) => {
    if (!ativo) return;
    ativo = false;
    palco.classList.remove('arrastando');
    palco.style.removeProperty('--braco-ang');
    if (!cancelado) {
      if (movido < 6) {
        if (modo === 'disco' && Date.now() - t0 < 400) player.alternar();
      } else {
        player.buscarTempo(previsto);
        if (store.config().dicaDisco) store.definirConfig({ dicaDisco: false });
      }
    }
    dica.textContent = TEXTO_DICA;
    dica.hidden = !store.config().dicaDisco;
    modo = null;
    aoFim();
  };
  palco.addEventListener('pointerup', (e) => { if (e.pointerId === idPonteiro) terminar(false); });
  palco.addEventListener('pointercancel', () => terminar(true));
}
