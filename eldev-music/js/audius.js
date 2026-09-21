// Catálogo de músicas: Audius (músicas inteiras, grátis, sem cadastro).
const BASE = 'https://api.audius.co/v1';
const APP = 'eldev-music';
const TTL = 5 * 60 * 1000;
const cache = new Map();

async function pegar(caminho, params = {}, sinal) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, app_name: APP })) (Array.isArray(v) ? v : [v]).forEach((x) => q.append(k, x));
  const url = `${BASE}${caminho}?${q}`;
  const antigo = cache.get(url);
  if (antigo && Date.now() - antigo.t < TTL) return antigo.dados;

  let erro;
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const ctl = new AbortController();
    const parar = () => ctl.abort();
    sinal?.addEventListener('abort', parar, { once: true });
    const limite = setTimeout(parar, 12000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error(`O Audius respondeu ${r.status}`);
      const { data } = await r.json();
      cache.set(url, { t: Date.now(), dados: data });
      return data;
    } catch (e) {
      if (sinal?.aborted) throw e;
      erro = e.name === 'AbortError' ? new Error('O Audius demorou demais') : e;
    } finally {
      clearTimeout(limite);
      sinal?.removeEventListener('abort', parar);
    }
  }
  throw erro;
}

// ---- transforma o que o Audius manda no formato do app ----
const tocavel = (t) =>
  t && !t.is_delete && !t.is_unlisted && t.is_streamable !== false && !t.is_stream_gated &&
  t.duration > 0 && t.access?.stream !== false;

const arte = (a, tam = '480x480') => a?.[tam] || a?.['480x480'] || a?.['150x150'] || a?.['1000x1000'] || '';

// servidores reserva da mesma imagem: os servidores do Audius às vezes caem
const espelhos = (a) => (a?.mirrors || []).filter((m) => /^https:\/\/[^/\s]+$/.test(m)).slice(0, 3);

export const daFaixa = (t) => ({
  id: `a:${t.id}`, src: 'audius', ref: t.id,
  titulo: t.title || 'Sem título',
  artista: t.user?.name || 'Artista',
  artistaId: t.user?.id || '',
  capa: arte(t.artwork),
  espelhos: espelhos(t.artwork),
  duracao: t.duration || 0,
  genero: t.genre || '',
  bpm: Math.round(t.bpm) || 0,
  tom: t.musical_key || '',
  clima: t.mood || '',
  plays: t.play_count || 0,
  link: t.permalink ? `https://audius.co${t.permalink}` : '',
});

const faixas = (lista) => (Array.isArray(lista) ? lista : []).filter(tocavel).map(daFaixa);

const daColecao = (p) => ({
  id: p.id, nome: p.playlist_name || 'Playlist', capa: arte(p.artwork), espelhos: espelhos(p.artwork),
  dono: p.user?.name || '', donoId: p.user?.id || '',
  total: p.track_count || 0, album: !!p.is_album, descricao: p.description || '',
});

const daArtista = (u) => ({
  id: u.id, nome: u.name || u.handle || 'Artista', handle: u.handle || '',
  foto: arte(u.profile_picture), espelhos: espelhos(u.profile_picture),
  fundo: u.cover_photo?.['640x'] || u.cover_photo?.['2000x'] || '',
  seguidores: u.follower_count || 0, faixas: u.track_count || 0, bio: u.bio || '',
});

const um = (d) => (Array.isArray(d) ? d[0] : d);

// ---- o que o app usa ----
export const urlDeStream = (ref) => `${BASE}/tracks/${encodeURIComponent(ref)}/stream?app_name=${APP}`;

export async function emAlta({ genero = '', limite = 20, periodo = 'week' } = {}, sinal) {
  const p = { limit: limite, time: periodo };
  if (genero) p.genre = genero;
  return faixas(await pegar('/tracks/trending', p, sinal));
}

// artistas pequenos: o Audius separa uma lista de músicas boas que quase ninguém ouviu ainda
export async function emAltaSubterranea({ genero = '', limite = 30 } = {}, sinal) {
  const p = { limit: limite };
  if (genero) p.genre = genero;
  return faixas(await pegar('/tracks/trending/underground', p, sinal));
}

// várias faixas de uma vez, na mesma ordem dos números pedidos (playlist recebida por link)
export async function faixasPorIds(ids, sinal) {
  const dados = await pegar('/tracks', { id: ids }, sinal);
  const porId = new Map(faixas(dados).map((f) => [f.ref, f]));
  return ids.map((id) => porId.get(id)).filter(Boolean);
}

export const buscarFaixas = async (q, limite = 20, sinal) =>
  faixas(await pegar('/tracks/search', { query: q, limit: limite }, sinal));

export const buscarPlaylists = async (q, limite = 10, sinal) =>
  (await pegar('/playlists/search', { query: q, limit: limite }, sinal)).filter((p) => !p.is_private && !p.is_delete && p.track_count > 0).map(daColecao);

export const buscarArtistas = async (q, limite = 10, sinal) =>
  (await pegar('/users/search', { query: q, limit: limite }, sinal)).map(daArtista);

export const playlistsEmAlta = async (limite = 12, sinal) =>
  (await pegar('/playlists/trending', { limit: limite, time: 'week' }, sinal)).filter((p) => p.track_count > 0).map(daColecao);

export async function playlist(id, sinal) {
  const p = um(await pegar(`/playlists/${encodeURIComponent(id)}`, {}, sinal));
  if (!p) throw new Error('Playlist não encontrada');
  return daColecao(p);
}

export const faixasDaPlaylist = async (id, sinal) =>
  faixas(await pegar(`/playlists/${encodeURIComponent(id)}/tracks`, {}, sinal));

export async function artista(id, sinal) {
  const u = um(await pegar(`/users/${encodeURIComponent(id)}`, {}, sinal));
  if (!u) throw new Error('Artista não encontrado');
  return daArtista(u);
}

export const faixasDoArtista = async (id, limite = 30, sinal) =>
  faixas(await pegar(`/users/${encodeURIComponent(id)}/tracks`, { limit: limite, sort: 'plays' }, sinal));
