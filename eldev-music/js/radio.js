// Rádio infinita: quando a lista acaba, escolhe músicas parecidas com a que estava tocando.
// O Audius não tem "músicas relacionadas", então a semelhança vem dos dados de cada faixa:
// gênero, BPM (batidas por minuto), clima e tom musical.
import * as audius from './audius.js';
import * as store from './store.js';

// Roda de Camelot: é como DJs sabem quais tons combinam entre si (número + letra A/B)
const NOTAS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MAIOR = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1]; // B, por nota (0 = dó)
const MENOR = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10]; // A, por nota

export function camelot(tom) {
  const m = /^([A-G])\s*(sharp|flat)?\s*(major|minor)/i.exec(tom || '');
  if (!m) return null;
  let nota = NOTAS[m[1].toUpperCase()];
  if (m[2]) nota = (nota + (m[2].toLowerCase() === 'sharp' ? 1 : 11)) % 12;
  const maior = m[3].toLowerCase() === 'major';
  return { n: (maior ? MAIOR : MENOR)[nota], letra: maior ? 'B' : 'A' };
}

export function tonsCompativeis(a, b) {
  const x = camelot(a);
  const y = camelot(b);
  if (!x || !y) return false;
  if (x.letra === y.letra) {
    const d = Math.abs(x.n - y.n);
    return d === 0 || d === 1 || d === 11;
  }
  return x.n === y.n;
}

// diferença de BPM, contando o dobro e a metade como "iguais" (70 combina com 140)
export function distanciaBpm(a, b) {
  if (!a || !b) return null;
  return Math.min(Math.abs(a - b), Math.abs(a * 2 - b), Math.abs(a - b * 2));
}

function generoDoHistorico() {
  const cont = {};
  for (const f of store.recentes()) if (f.genero) cont[f.genero] = (cont[f.genero] || 0) + 1;
  return Object.entries(cont).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

// devolve até `quantidade` músicas parecidas com `semente`, sem repetir nenhuma de `evitar`
export async function sugerir({ semente, evitar = new Set(), quantidade = 12 }, sinal) {
  if (!semente || semente.src !== 'audius') return []; // arquivo do aparelho não traz dados pra comparar
  const genero = semente.genero || generoDoHistorico();
  const respostas = await Promise.allSettled([
    audius.emAlta({ genero, limite: 50, periodo: 'month' }, sinal),
    audius.emAlta({ genero, limite: 50, periodo: 'week' }, sinal),
    audius.emAltaSubterranea({ genero, limite: 30 }, sinal),
  ]);

  const candidatas = new Map();
  respostas.forEach((r, i) => {
    for (const f of r.value || []) {
      if (!candidatas.has(f.id) && !evitar.has(f.id)) candidatas.set(f.id, { f, garimpo: i === 2 });
    }
  });
  if (!candidatas.size) return [];

  const ordenadas = [...candidatas.values()]
    .map(({ f, garimpo }) => {
      let p = Math.random() * 1.5; // um pouco de sorte pra não vir sempre a mesma lista
      const d = distanciaBpm(semente.bpm, f.bpm);
      if (d !== null) p += Math.max(0, 6 - d / 3);
      if (semente.clima && f.clima === semente.clima) p += 2;
      if (tonsCompativeis(semente.tom, f.tom)) p += 1.5;
      if (f.artistaId && f.artistaId === semente.artistaId) p -= 2;
      if (garimpo) p += 0.8; // um toque de descoberta no meio
      return { f, p };
    })
    .sort((a, b) => b.p - a.p);

  const porArtista = new Map();
  const saida = [];
  for (const { f } of ordenadas) {
    const n = porArtista.get(f.artistaId) || 0;
    if (n >= 2) continue; // no máximo 2 do mesmo artista
    porArtista.set(f.artistaId, n + 1);
    saida.push(f);
    if (saida.length >= quantidade) break;
  }
  return saida;
}
