// Playlist em link: a playlist inteira vai dentro do endereço (só os números das músicas do Audius).
// Quem abre o link vê a lista e salva na própria coleção. Não precisa de conta nem de servidor.
import { avisar, perguntar } from './ui.js';

const MAX = 120;

const paraB64 = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export function paraLink(nome, faixas) {
  const refs = faixas.filter((f) => f.src === 'audius').slice(0, MAX).map((f) => f.ref);
  const dados = JSON.stringify({ v: 1, n: nome.slice(0, 60), t: refs });
  const base = new URL('./', location.href).href;
  return {
    url: `${base}#/importar/${paraB64(new TextEncoder().encode(dados))}`,
    incluidas: refs.length,
    fora: faixas.length - refs.length,
  };
}

// o que veio no link é de fora: confere tudo antes de usar
export function deLink(texto) {
  try {
    const j = JSON.parse(new TextDecoder().decode(deB64(texto)));
    if (j?.v !== 1 || typeof j.n !== 'string' || !Array.isArray(j.t)) return null;
    const refs = j.t.filter((r) => typeof r === 'string' && /^[A-Za-z0-9]{3,12}$/.test(r)).slice(0, MAX);
    if (!refs.length) return null;
    return { nome: j.n.trim().slice(0, 60) || 'Playlist de um amigo', refs };
  } catch {
    return null;
  }
}

export async function compartilharLink(nome, faixas) {
  const { url, incluidas, fora } = paraLink(nome, faixas);
  if (!incluidas) { avisar('Só músicas do Audius vão no link, e esta lista não tem nenhuma'); return; }
  const nota = fora ? ` ${fora === 1 ? '1 música do aparelho ficou de fora.' : `${fora} músicas do aparelho ficaram de fora.`}` : '';
  try {
    if (navigator.share) {
      await navigator.share({ title: `${nome} · Eldev Music`, text: `Uma playlist pra você ouvir: ${nome}`, url });
      if (fora) avisar(nota.trim());
      return;
    }
    await navigator.clipboard.writeText(url);
    avisar(`Link copiado.${nota}`);
  } catch (e) {
    if (e?.name === 'AbortError') return;
    // sem permissão pra copiar: mostra o link pra pessoa copiar na mão
    await perguntar({ titulo: 'Link da playlist', ok: '', texto: `Copie este link e mande pra quem quiser.${nota}`, campo: { rotulo: 'Link', valor: url, max: 4000, opcional: true } });
  }
}
