// Cores da capa: tira de 1 a 3 cores fortes da capa da música pra pintar as luzes do fundo.
import { capaDe } from './db.js';

const cache = new Map(); // id da faixa -> paleta (ou null quando a capa não deu pra ler)

function carregar(url) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // sem isso o navegador não deixa ler os pixels da imagem
    img.onload = () => ok(img);
    img.onerror = () => falha(new Error('a imagem não carregou'));
    img.src = url;
  });
}

// cor -> matiz (0 a 360), saturação e brilho (0 a 1)
function hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

function rgbDe(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const css = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

// deixa a cor viva o bastante pra brilhar no fundo escuro
function realcar([r, g, b]) {
  const [h, s, v] = hsv(r, g, b);
  return rgbDe(h, Math.min(0.95, Math.max(0.6, s)), Math.min(1, Math.max(0.78, v)));
}

// junta os pixels por matiz (faixas de 20°), ignora preto, branco e cinza, e pega até 3 matizes bem diferentes
export function escolherCores(dados) {
  const baldes = Array.from({ length: 18 }, () => ({ peso: 0, r: 0, g: 0, b: 0 }));
  let total = 0;
  for (let i = 0; i < dados.length; i += 4) {
    if (dados[i + 3] < 200) continue;
    const [h, s, v] = hsv(dados[i], dados[i + 1], dados[i + 2]);
    if (v < 0.22 || s < 0.28) continue;
    const w = s * v;
    const b = baldes[Math.floor(h / 20) % 18];
    b.peso += w;
    b.r += dados[i] * w;
    b.g += dados[i + 1] * w;
    b.b += dados[i + 2] * w;
    total += w;
  }
  if (!total) return []; // capa toda em preto, branco ou cinza: sem cor forte pra usar
  const ordem = baldes.map((b, k) => ({ ...b, k })).filter((b) => b.peso >= total * 0.05).sort((a, b) => b.peso - a.peso);
  const escolhidas = [];
  for (const b of ordem) {
    const longe = escolhidas.every((c) => { const d = Math.abs(c.k - b.k); return Math.min(d, 18 - d) >= 2; });
    if (longe) escolhidas.push(b);
    if (escolhidas.length === 3) break;
  }
  return escolhidas.map((b) => realcar([b.r / b.peso, b.g / b.peso, b.b / b.peso]));
}

// sempre 3 cores (se a capa só tem uma, as outras são variações dela), ou null se não tem cor forte
export function paletaDe(dados) {
  const base = escolherCores(dados);
  if (!base.length) return null;
  const desloca = ([r, g, b], graus) => { const [h, s, v] = hsv(r, g, b); return rgbDe((h + graus + 360) % 360, s, v); };
  const [a, b = desloca(a, 30), c = desloca(a, -25)] = base;
  return [a, b, c].map(css);
}

export async function paletaDaCapa(f) {
  if (cache.has(f.id)) return cache.get(f.id);
  const url = capaDe(f).replace('480x480', '150x150'); // a pequena basta pra achar as cores
  const candidatas = url
    ? [url, ...(f.espelhos || []).map((m) => { try { return m + new URL(url).pathname; } catch { return ''; } })]
    : [];
  for (const u of candidatas) {
    if (!/^(blob:|https:)/.test(u)) continue;
    try {
      const img = await carregar(u);
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 24, 24);
      const paleta = paletaDe(ctx.getImageData(0, 0, 24, 24).data); // dá erro se o servidor da imagem não permitir a leitura
      cache.set(f.id, paleta);
      return paleta;
    } catch {
      /* tenta o servidor reserva */
    }
  }
  cache.set(f.id, null);
  return null;
}
