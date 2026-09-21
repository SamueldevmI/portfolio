// Tudo que é do usuário (favoritas, playlists, histórico) fica guardado no aparelho. Nada sai daqui.
// (por dentro as favoritas se chamam "curtidas": é só o nome do dado guardado)
import { uid } from './util.js';

const CHAVE = 'eldev-music:v1';
const padrao = () => ({
  curtidas: [], playlists: [], salvas: [], meus: [], baixadas: [], recentes: [], buscas: [],
  fila: null, config: { nome: '', volume: 1, radio: true, dicaDisco: true, efeitos: 'completo' },
});

function ler() {
  try {
    const j = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    const p = padrao();
    return j ? { ...p, ...j, config: { ...p.config, ...(j.config || {}) } } : p;
  } catch {
    return padrao();
  }
}

let dados = ler();
let idsBaixados = new Set(dados.baixadas.map((f) => f.id));
const ouvintes = new Set();
let espera = 0;

export function gravar() {
  clearTimeout(espera);
  try { localStorage.setItem(CHAVE, JSON.stringify(dados)); return true; } catch { return false; }
}

function agendar() {
  clearTimeout(espera);
  espera = setTimeout(gravar, 250);
}

function mudou(tipo) {
  agendar();
  ouvintes.forEach((f) => f(tipo));
}

addEventListener('pagehide', gravar);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') gravar();
});

export function ouvir(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

// só o necessário de cada faixa, pra não guardar coisa demais
export const faixaMagra = (f) => ({
  id: f.id, src: f.src, ref: f.ref, titulo: f.titulo, artista: f.artista,
  artistaId: f.artistaId || '', capa: f.src === 'local' ? '' : f.capa || '', espelhos: f.espelhos || [],
  duracao: f.duracao || 0, genero: f.genero || '', link: f.link || '',
  bpm: f.bpm || 0, tom: f.tom || '', clima: f.clima || '', plays: f.plays || 0,
});

// ---- configurações ----
export const config = () => dados.config;
export function definirConfig(parte) {
  Object.assign(dados.config, parte);
  mudou('config');
}

// ---- curtidas ----
export const curtidas = () => dados.curtidas;
export const curtida = (id) => dados.curtidas.some((f) => f.id === id);
export function alternarCurtida(f) {
  const i = dados.curtidas.findIndex((x) => x.id === f.id);
  if (i >= 0) dados.curtidas.splice(i, 1);
  else dados.curtidas.unshift(faixaMagra(f));
  mudou('curtidas');
  return i < 0;
}

// ---- playlists do usuário ----
export const playlists = () => dados.playlists;
export const playlist = (id) => dados.playlists.find((p) => p.id === id);

export function criarPlaylist(nome, faixas = []) {
  const p = { id: uid(), nome: nome.trim() || 'Nova playlist', faixas: faixas.map(faixaMagra), criada: Date.now() };
  dados.playlists.unshift(p);
  mudou('playlists');
  return p;
}

export function renomearPlaylist(id, nome) {
  const p = playlist(id);
  if (!p || !nome.trim()) return;
  p.nome = nome.trim();
  mudou('playlists');
}

export function excluirPlaylist(id) {
  dados.playlists = dados.playlists.filter((p) => p.id !== id);
  mudou('playlists');
}

export function adicionarNaPlaylist(id, f) {
  const p = playlist(id);
  if (!p || p.faixas.some((x) => x.id === f.id)) return false;
  p.faixas.push(faixaMagra(f));
  mudou('playlists');
  return true;
}

export function removerDaPlaylist(id, faixaId) {
  const p = playlist(id);
  if (!p) return;
  p.faixas = p.faixas.filter((x) => x.id !== faixaId);
  mudou('playlists');
}

// ---- playlists do Audius salvas na biblioteca ----
export const salvas = () => dados.salvas;
export const colecaoSalva = (id) => dados.salvas.some((c) => c.id === id);
export function alternarSalva(c) {
  const i = dados.salvas.findIndex((x) => x.id === c.id);
  if (i >= 0) dados.salvas.splice(i, 1);
  else dados.salvas.unshift({ id: c.id, nome: c.nome, capa: c.capa, espelhos: c.espelhos || [], dono: c.dono, total: c.total });
  mudou('salvas');
  return i < 0;
}

// ---- arquivos do próprio usuário (o áudio fica no IndexedDB, aqui só a ficha) ----
export const meus = () => dados.meus;
export function adicionarMeu(f) {
  dados.meus.unshift(faixaMagra(f));
  mudou('meus');
}

// tira a faixa de todo lugar (ao apagar um arquivo do aparelho)
export function esquecerFaixa(id) {
  dados.meus = dados.meus.filter((f) => f.id !== id);
  dados.curtidas = dados.curtidas.filter((f) => f.id !== id);
  dados.recentes = dados.recentes.filter((f) => f.id !== id);
  dados.playlists.forEach((p) => { p.faixas = p.faixas.filter((f) => f.id !== id); });
  mudou('meus');
}

// ---- músicas do Audius baixadas pra ouvir sem internet (o áudio fica no IndexedDB, aqui só a ficha) ----
export const baixadas = () => dados.baixadas;
export const estaBaixadaId = (id) => idsBaixados.has(id);
export const bytesBaixados = () => dados.baixadas.reduce((s, f) => s + (f.bytes || 0), 0);

export function adicionarBaixada(f, bytes) {
  if (idsBaixados.has(f.id)) return;
  dados.baixadas.unshift({ ...faixaMagra(f), bytes });
  idsBaixados.add(f.id);
  mudou('baixadas');
}

export function removerBaixada(id) {
  dados.baixadas = dados.baixadas.filter((f) => f.id !== id);
  idsBaixados.delete(id);
  mudou('baixadas');
}

// ---- histórico ----
export const recentes = () => dados.recentes;
export function registrarRecente(f) {
  dados.recentes = [faixaMagra(f), ...dados.recentes.filter((x) => x.id !== f.id)].slice(0, 30);
  mudou('recentes');
}

export const buscas = () => dados.buscas;
export function registrarBusca(q) {
  q = q.trim();
  if (!q) return;
  dados.buscas = [q, ...dados.buscas.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  mudou('buscas');
}
export function apagarBusca(q) {
  dados.buscas = dados.buscas.filter((x) => x !== q);
  mudou('buscas');
}

// ---- fila de reprodução (pra voltar de onde parou) ----
export const fila = () => dados.fila;
export function guardarFila(f) {
  dados.fila = f;
  agendar();
}

export function apagarTudo() {
  dados = padrao();
  idsBaixados = new Set();
  gravar();
  ['curtidas', 'playlists', 'salvas', 'meus', 'baixadas', 'recentes', 'buscas', 'config'].forEach(mudou);
}
