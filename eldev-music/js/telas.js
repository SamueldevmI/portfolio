// As telas do app. Cada uma recebe { tela, sinal, arg } e desenha dentro de #tela.
import * as store from './store.js';
import * as audius from './audius.js';
import * as player from './player.js';
import { esc, plural, debounce, fmtDuracaoLonga, fmtNumero, gradientePorId } from './util.js';
import { capaDe } from './db.js';
import {
  icone, capaHtml, discoHtml, registrar, lista, linhaFaixa, cartaoFaixa, cartaoLink, cartaoPaisagem,
  esqueleto, vazio, avisar, perguntar,
} from './ui.js';
import { novaPlaylist } from './menus.js';

const enc = encodeURIComponent;

export const GENEROS = [
  ['Electronic', 'Eletrônica'], ['Hip-Hop/Rap', 'Hip-Hop / Rap'], ['Pop', 'Pop'], ['Rock', 'Rock'],
  ['Lo-Fi', 'Lo-Fi'], ['Latin', 'Latina'], ['Jazz', 'Jazz'], ['R&B/Soul', 'R&B / Soul'],
  ['Ambient', 'Ambiente'], ['Reggae', 'Reggae'], ['Classical', 'Clássica'], ['Country', 'Country'],
  ['Metal', 'Metal'], ['Trap', 'Trap'], ['House', 'House'], ['Funk', 'Funk'], ['Folk', 'Folk'], ['Podcasts', 'Podcasts'],
];
export const nomeGenero = (g) => GENEROS.find(([v]) => v === g)?.[1] || g;

const ABAS_GENERO = [['', 'Tudo'], ['Electronic', 'Eletrônica'], ['Hip-Hop/Rap', 'Hip-Hop'], ['Pop', 'Pop'], ['Rock', 'Rock'], ['Lo-Fi', 'Lo-Fi'], ['Podcasts', 'Podcasts']];
let generoAtivo = '';
export const escolherChip = (g) => { generoAtivo = g; };

// ---------- peças comuns ----------
const cartoesFaixas = (faixas, rank = false) => {
  const k = registrar(faixas);
  return faixas.map((f, i) => cartaoFaixa(f, k, i, { rank })).join('');
};

const subColecao = (c) => [c.dono, c.total ? `${c.total} músicas` : ''].filter(Boolean).join(' · ');

export const cartaoColecao = (c) => cartaoLink({
  href: `#/audius/playlist/${enc(c.id)}`, capa: c.capa, espelhos: c.espelhos, semente: c.id, titulo: c.nome, sub: subColecao(c),
});

const cartaoColecaoLargo = (c) => cartaoPaisagem({
  href: `#/audius/playlist/${enc(c.id)}`, capa: c.capa, espelhos: c.espelhos, semente: c.id, titulo: c.nome, sub: subColecao(c),
});

const cartaoArtista = (a) => cartaoLink({
  href: `#/artista/${enc(a.id)}`, capa: a.foto, espelhos: a.espelhos, semente: a.id, titulo: a.nome,
  sub: a.seguidores ? `${fmtNumero(a.seguidores)} seguidores` : 'Artista', redondo: true,
});

const resumo = (faixas) => {
  const seg = faixas.reduce((s, f) => s + (f.duracao || 0), 0);
  return `${plural(faixas.length, 'música', 'músicas')}${seg ? ` · ${fmtDuracaoLonga(seg)}` : ''}`;
};

const botaoVoltar = `<button class="voltar" data-acao="voltar" aria-label="Voltar">${icone('esquerda')}</button>`;

const erroPagina = (msg = 'Não consegui carregar agora. Confira a internet e tente de novo.') =>
  botaoVoltar + vazio({ icone: 'aviso', titulo: 'Sem conexão com o Audius', texto: msg, botao: { acao: 'recarregar', rotulo: 'Tentar de novo' } });

const esqueletoPagina = () => `${botaoVoltar}
  <div class="colecao-topo"><div class="esq colecao-capa"><i></i></div><div class="colecao-info esq" style="width:70%"><u></u><u></u></div></div>
  <div class="lista">${Array.from({ length: 6 }, () => '<div class="faixa"><div class="faixa-tocar"><span class="capa" style="--g:var(--sup2)"></span><span class="faixa-txt esq"><u style="width:60%"></u></span></div></div>').join('')}</div>`;

// capa quadrada de uma coleção do usuário: 4 capas juntas, 1 capa ou só o degradê
function capaDaColecao(faixas, semente) {
  const com = faixas.filter((f) => capaDe(f));
  if (com.length >= 4) {
    return `<span class="capa colecao-capa mosaico" style="--g:${gradientePorId(semente)}">${
      com.slice(0, 4).map((f) => capaHtml(capaDe(f), f.id, '', f.espelhos || [])).join('')}</span>`;
  }
  if (com.length) return capaHtml(capaDe(com[0]), com[0].id, 'colecao-capa', com[0].espelhos || []);
  return capaHtml('', semente, 'colecao-capa');
}

const capaEspecial = (cls, ic) => `<span class="capa colecao-capa especial ${cls}">${icone(ic)}</span>`;

// página de coleção: cabeçalho, botões grandes e a lista de músicas
function paginaColecao({ tela, etiqueta, titulo, sub = '', subHtml = '', capa, semDisco = false, faixas, playlistId = '', botoes = '', filtros = '', vazioMsg = '', bio = '' }) {
  const k = registrar(faixas);
  tela.innerHTML = `<div${playlistId ? ` data-playlist="${esc(playlistId)}"` : ''}>
    ${botaoVoltar}
    <header class="colecao-topo">
      <div class="sleeve${semDisco ? ' sem-disco' : ''}">${capa}</div>
      <div class="colecao-info">
        <p class="etiqueta">${esc(etiqueta)}</p>
        <h1>${esc(titulo)}</h1>
        ${subHtml || (sub ? `<p class="sub">${esc(sub)}</p>` : '')}
        ${bio ? `<p class="bio">${esc(bio.slice(0, 280))}${bio.length > 280 ? '…' : ''}</p>` : ''}
      </div>
    </header>
    <div class="acoes">
      ${faixas.length ? `<button class="play-grande" data-acao="tocar-tudo" data-lista="${k}" aria-label="Tocar tudo">${icone('play')}</button>
      <button class="icone" data-acao="misturar-tudo" data-lista="${k}" aria-label="Tocar em ordem aleatória">${icone('shuffle')}</button>` : ''}
      ${botoes}
    </div>
    ${filtros}
    ${faixas.length ? `<div class="lista">${faixas.map((f, i) => linhaFaixa(f, k, i, { duracao: true })).join('')}</div>` : vazioMsg}
  </div>`;
}

export function naoEncontrada({ tela }, titulo = 'Página não encontrada') {
  tela.innerHTML = `${botaoVoltar}<div class="vazio" style="padding-top:96px">${icone('aviso')}<h2>${esc(titulo)}</h2><a class="botao primario" href="#/">Ir para o início</a></div>`;
}

// ---------- início ----------
function saudacao() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

// atalhos da coleção
function canto() {
  const fig = (href, ic, cls, nome, sub) => `
    <a class="figurinha" href="${esc(href)}"><span class="fig-ic ${cls}">${icone(ic)}</span><span class="fig-txt"><b>${esc(nome)}</b><small>${esc(sub)}</small></span></a>`;
  return `<section class="canto" aria-label="Sua coleção">
    ${fig('#/curtidas', 'estrela-cheia', 'fav', 'Favoritas', plural(store.curtidas().length, 'música', 'músicas'))}
    ${fig('#/meus', 'arquivo', 'aparelho', 'No aparelho', plural(store.meus().length, 'arquivo', 'arquivos'))}
    ${store.playlists().slice(0, 8).map((p) => fig(`#/playlist/${p.id}`, 'biblioteca', 'pl', p.nome, plural(p.faixas.length, 'música', 'músicas'))).join('')}
    <button class="figurinha nova" data-acao="nova-playlist"><span class="fig-ic">${icone('adicionar')}</span><span class="fig-txt"><b>Nova playlist</b><small>Crie a sua</small></span></button>
  </section>`;
}

// destaque grande: a última música tocada, ou a que está em alta
function destaque(f, chave, i, etiqueta) {
  const capa = capaDe(f);
  const reserva = (f.espelhos || []).join(' ');
  return `<section class="hero" aria-label="${esc(etiqueta)}">
    ${capa ? `<img class="hero-fundo" src="${esc(capa)}" alt="" data-alt="${esc(reserva)}">` : ''}
    <div class="hero-texto">
      <p class="etiqueta">${esc(etiqueta)}</p>
      <h2 class="hero-titulo">${esc(f.titulo)}</h2>
      <p class="hero-artista">${esc(f.artista)}</p>
      <button class="botao primario" data-acao="tocar" data-lista="${chave}" data-i="${i}">${icone('play')}Tocar</button>
    </div>
    <div class="hero-disco">${discoHtml(capa, f.id, f.espelhos || [])}</div>
  </section>`;
}

let contador = 0;
const secao = ({ titulo, ver, conteudo = esqueleto(6) }) => {
  const id = `bl${++contador}`;
  return {
    id,
    html: `<section class="bloco" id="${id}">
      <div class="bloco-topo"><h2>${esc(titulo)}</h2>${ver ? `<a class="ver" href="${esc(ver)}">Ver tudo</a>` : ''}</div>
      <div class="prateleira">${conteudo}</div>
    </section>`,
  };
};

async function preencher(b, sinal) {
  const sec = document.getElementById(b.id);
  try {
    const itens = await b.busca(sinal);
    if (sinal.aborted || !sec?.isConnected) return true;
    if (!itens.length) { sec.remove(); return true; }
    sec.querySelector('.prateleira').innerHTML = b.tipo === 'colecoes' ? itens.map(cartaoColecaoLargo).join('') : cartoesFaixas(itens, b.tipo === 'parada');
    b.aoCarregar?.(itens);
    return true;
  } catch {
    if (sinal.aborted || !sec?.isConnected) return true;
    sec.querySelector('.prateleira').innerHTML = '<p class="sub">Não deu pra carregar agora.</p>';
    b.aoFalhar?.();
    return false;
  }
}

export async function inicio({ tela, sinal }) {
  const { nome } = store.config();
  const sau = saudacao();
  tela.innerHTML = `
    <header class="topo topo-home">
      <a class="marca" href="#/" aria-label="Eldev Music, início">${icone('logo')}<span><b>Eldev</b> Music</span></a>
      <div class="topo-acoes"><button class="icone" data-acao="config" aria-label="Configurações">${icone('config')}</button></div>
    </header>
    <h1 class="saudacao">${esc(sau)}${nome ? `,<br><em>${esc(nome)}</em>` : '.'}</h1>
    <div id="destaque"></div>
    ${canto()}
    <div class="gen-abas" role="group" aria-label="Filtrar por gênero">
      ${ABAS_GENERO.map(([v, n]) => `<button class="gen-aba" data-acao="chip" data-g="${esc(v)}" aria-pressed="${v === generoAtivo}">${esc(n)}</button>`).join('')}
    </div>
    <div id="prateleiras"></div>`;

  const raiz = tela.querySelector('#prateleiras');
  const caixaDestaque = tela.querySelector('#destaque');
  const g = generoAtivo;

  // destaque: quem já ouviu algo continua de onde parou; quem não, vê a música que está em alta
  const recentes = store.recentes();
  if (recentes.length) caixaDestaque.innerHTML = destaque(recentes[0], registrar(recentes), 0, 'Continue de onde parou');
  else caixaDestaque.innerHTML = '<div class="hero esq-hero" aria-hidden="true"></div>';
  const destaqueDe = (etiqueta) => (itens) => {
    if (recentes.length || !caixaDestaque.isConnected) return;
    caixaDestaque.innerHTML = destaque(itens[0], registrar(itens), 0, etiqueta);
  };
  const semDestaque = () => { if (!recentes.length) caixaDestaque.innerHTML = ''; };

  const remotos = g
    ? [
        { titulo: `Top de ${nomeGenero(g)}`, tipo: 'parada', ver: `#/genero/${enc(g)}`, busca: (s) => audius.emAlta({ genero: g, limite: 20 }, s), aoCarregar: destaqueDe(`Em alta em ${nomeGenero(g)}`), aoFalhar: semDestaque },
        { titulo: 'Em alta no mês', busca: (s) => audius.emAlta({ genero: g, limite: 20, periodo: 'month' }, s) },
        { titulo: 'Clássicas de todos os tempos', busca: (s) => audius.emAlta({ genero: g, limite: 20, periodo: 'allTime' }, s) },
      ]
    : [
        { titulo: 'Top da semana', tipo: 'parada', ver: '#/genero/todos', busca: (s) => audius.emAlta({ limite: 20 }, s), aoCarregar: destaqueDe('Em alta agora'), aoFalhar: semDestaque },
        { titulo: 'Playlists da comunidade', tipo: 'colecoes', busca: (s) => audius.playlistsEmAlta(12, s) },
        ...['Lo-Fi', 'Electronic', 'Hip-Hop/Rap', 'Pop', 'Rock'].map((gen) => ({
          titulo: nomeGenero(gen), ver: `#/genero/${enc(gen)}`, busca: (s) => audius.emAlta({ genero: gen, limite: 15 }, s),
        })),
      ];

  const primeira = !g && recentes.length ? secao({ titulo: 'Ouvidas há pouco', conteudo: cartoesFaixas(recentes.slice(0, 15)) }).html : '';
  const blocos = remotos.map((b) => ({ ...b, ...secao(b) }));
  raiz.innerHTML = primeira + blocos.map((b) => b.html).join('');

  const resultados = await Promise.all(blocos.map((b) => preencher(b, sinal)));
  if (!sinal.aborted && !resultados.some(Boolean)) {
    raiz.innerHTML = vazio({
      icone: 'aviso', titulo: 'Sem conexão com o Audius',
      texto: 'Não consegui buscar as músicas agora. Confira a internet e tente de novo.',
      botao: { acao: 'recarregar', rotulo: 'Tentar de novo' },
    });
  }
}

// ---------- buscar ----------
export async function buscar({ tela, sinal, arg }) {
  const q0 = arg[1] || '';
  tela.innerHTML = `
    <div class="busca-topo">
      <h1>Buscar</h1>
      <label class="campo-busca">${icone('search')}
        <input id="q" type="search" placeholder="Músicas, artistas, playlists" enterkeyhint="search" autocomplete="off" spellcheck="false" value="${esc(q0)}" aria-label="Buscar músicas, artistas e playlists">
        <button class="icone" data-acao="limpar-busca" aria-label="Limpar a busca" hidden>${icone('x')}</button>
      </label>
    </div>
    <div id="resultado"></div>`;
  const campo = tela.querySelector('#q');
  const limpar = tela.querySelector('[data-acao="limpar-busca"]');
  const res = tela.querySelector('#resultado');
  let ctl = null;

  const inicial = () => {
    const rec = store.buscas();
    res.innerHTML = `${rec.length ? `<h2 class="secao-titulo" style="margin-top:8px">Buscas recentes</h2><div class="recentes-busca">${rec.map((q) => `
        <span class="chip composto"><button data-acao="busca-recente" data-q="${esc(q)}">${esc(q)}</button><button data-acao="apagar-busca" data-q="${esc(q)}" aria-label="Apagar ${esc(q)} das buscas recentes">${icone('x')}</button></span>`).join('')}</div>` : ''}
      <h2 class="secao-titulo" style="margin-top:8px">Navegar por gênero</h2>
      <div class="generos">${GENEROS.map(([v, n]) => `<a class="genero" href="#/genero/${enc(v)}" style="--g:${gradientePorId(v)}"><span>${esc(n)}</span>${icone('seta')}</a>`).join('')}</div>`;
  };

  const rodar = async (texto) => {
    const q = texto.trim();
    limpar.hidden = !campo.value;
    history.replaceState(history.state, '', q ? `#/buscar/${enc(q)}` : '#/buscar');
    ctl?.abort();
    if (!q) return inicial();
    ctl = new AbortController();
    const s = AbortSignal.any ? AbortSignal.any([sinal, ctl.signal]) : ctl.signal;
    res.innerHTML = `<div class="prateleira" style="margin-top:16px">${esqueleto(4)}</div>`;
    const [f, c, a] = await Promise.allSettled([audius.buscarFaixas(q, 20, s), audius.buscarPlaylists(q, 10, s), audius.buscarArtistas(q, 10, s)]);
    if (s.aborted) return;
    if ([f, c, a].every((x) => x.status === 'rejected')) {
      res.innerHTML = vazio({ icone: 'aviso', titulo: 'Sem conexão com o Audius', texto: 'Não consegui buscar agora. Confira a internet e tente de novo.', botao: { acao: 'recarregar', rotulo: 'Tentar de novo' } });
      return;
    }
    const faixas = f.value || [];
    const colecoes = c.value || [];
    const artistas = (a.value || []).slice(0, 10);
    if (!faixas.length && !colecoes.length && !artistas.length) {
      res.innerHTML = vazio({ icone: 'search', titulo: `Nada encontrado para “${q}”`, texto: 'Confira a escrita ou tente outra palavra.' });
      return;
    }
    const k = registrar(faixas);
    res.innerHTML = `
      ${faixas.length ? `<h2 class="secao-titulo" style="margin-top:8px">Músicas</h2><div class="lista">${faixas.map((x, i) => linhaFaixa(x, k, i)).join('')}</div>` : ''}
      ${artistas.length ? `<h2 class="secao-titulo">Artistas</h2><div class="prateleira">${artistas.map(cartaoArtista).join('')}</div>` : ''}
      ${colecoes.length ? `<h2 class="secao-titulo">Playlists</h2><div class="prateleira">${colecoes.map(cartaoColecao).join('')}</div>` : ''}`;
  };

  campo.addEventListener('input', debounce(() => rodar(campo.value), 350));
  campo.addEventListener('input', () => { limpar.hidden = !campo.value; });
  campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { rodar(campo.value); campo.blur(); } });
  campo.addEventListener('change', () => store.registrarBusca(campo.value));
  if (q0) rodar(q0); else inicial();
  if (!q0 && matchMedia('(hover: hover)').matches) campo.focus({ preventScroll: true });
}

// ---------- coleção ----------
const linhaColecao = ({ href, capa, titulo, sub }) => `
  <a class="faixa" href="${esc(href)}"><span class="faixa-tocar">${capa}<span class="faixa-txt"><b>${esc(titulo)}</b><span>${esc(sub)}</span></span></span></a>`;

export function biblioteca({ tela }) {
  const meus = store.meus();
  const recentes = store.recentes().slice(0, 12);
  const k = registrar(recentes);
  tela.innerHTML = `
    <header class="topo">
      <h1>Coleção</h1>
      <div class="topo-acoes"><button class="icone" data-acao="nova-playlist" aria-label="Criar playlist">${icone('adicionar')}</button></div>
    </header>
    <div class="lista">
      ${linhaColecao({ href: '#/curtidas', capa: `<span class="capa especial curtidas">${icone('estrela-cheia')}</span>`, titulo: 'Favoritas', sub: plural(store.curtidas().length, 'música', 'músicas') })}
      ${linhaColecao({ href: '#/meus', capa: `<span class="capa especial meus">${icone('arquivo')}</span>`, titulo: 'No aparelho', sub: `${plural(meus.length, 'arquivo', 'arquivos')} guardados aqui` })}
      ${store.playlists().map((p) => linhaColecao({
        href: `#/playlist/${p.id}`, capa: capaHtml(p.faixas[0] ? capaDe(p.faixas[0]) : '', p.id, '', p.faixas[0]?.espelhos || []),
        titulo: p.nome, sub: `Playlist · ${plural(p.faixas.length, 'música', 'músicas')}`,
      })).join('')}
      ${store.salvas().map((c) => linhaColecao({
        href: `#/audius/playlist/${enc(c.id)}`, capa: capaHtml(c.capa, c.id, '', c.espelhos || []), titulo: c.nome, sub: `Playlist · ${c.dono || 'Audius'}`,
      })).join('')}
    </div>
    ${recentes.length ? `<h2 class="secao-titulo">Ouvidas há pouco</h2><div class="lista">${recentes.map((f, i) => linhaFaixa(f, k, i)).join('')}</div>` : ''}`;
}

export function curtidasTela({ tela }) {
  const faixas = store.curtidas();
  paginaColecao({
    tela, etiqueta: 'Coleção', titulo: 'Favoritas', sub: resumo(faixas), capa: capaEspecial('curtidas', 'estrela-cheia'), faixas,
    vazioMsg: vazio({ icone: 'estrela', titulo: 'Suas favoritas aparecem aqui', texto: 'Toque na estrela de uma música pra guardar ela aqui.' }),
  });
}

export function meusTela({ tela }) {
  const faixas = store.meus();
  const botaoAdd = `${faixas.length ? '<span class="espaco"></span>' : ''}<button class="botao primario" data-acao="add-arquivos">${icone('arquivo')}Adicionar arquivos</button>`;
  paginaColecao({
    tela, etiqueta: 'Neste aparelho', titulo: 'No aparelho', sub: faixas.length ? resumo(faixas) : 'Só você vê estas músicas', capa: capaEspecial('meus', 'arquivo'),
    faixas, botoes: botaoAdd,
    vazioMsg: vazio({
      icone: 'arquivo', titulo: 'Coloque suas próprias músicas',
      texto: 'Escolha arquivos de áudio (mp3, m4a, flac...) do celular ou do computador. Eles ficam guardados só neste aparelho e tocam sem internet.',
    }),
  });
}

export function playlistTela({ tela, arg }) {
  const p = store.playlist(arg[1]);
  if (!p) return naoEncontrada({ tela }, 'Playlist não encontrada');
  paginaColecao({
    tela, etiqueta: 'Playlist', titulo: p.nome, sub: resumo(p.faixas), capa: capaDaColecao(p.faixas, p.id), faixas: p.faixas, playlistId: p.id,
    botoes: `<span class="espaco"></span>
      <button class="icone" data-acao="renomear-pl" data-id="${esc(p.id)}" aria-label="Renomear a playlist">${icone('editar')}</button>
      <button class="icone" data-acao="excluir-pl" data-id="${esc(p.id)}" aria-label="Excluir a playlist">${icone('lixo')}</button>`,
    vazioMsg: vazio({ icone: 'add-lista', titulo: 'Playlist vazia', texto: 'Toque nos três pontinhos de qualquer música e escolha “Adicionar à playlist”.' }),
  });
}

let colecaoAudius = null;

export async function playlistAudius({ tela, sinal, arg }) {
  tela.innerHTML = esqueletoPagina();
  try {
    const [c, faixas] = await Promise.all([audius.playlist(arg[2], sinal), audius.faixasDaPlaylist(arg[2], sinal)]);
    if (sinal.aborted) return;
    colecaoAudius = c;
    const salva = store.colecaoSalva(c.id);
    paginaColecao({
      tela, etiqueta: c.album ? 'Álbum' : 'Playlist', titulo: c.nome, capa: capaHtml(c.capa, c.id, 'colecao-capa', c.espelhos), faixas,
      subHtml: `<p class="sub">${c.donoId ? `<a href="#/artista/${enc(c.donoId)}"><b>${esc(c.dono)}</b></a> · ` : ''}${esc(resumo(faixas))}</p>`,
      bio: c.descricao,
      botoes: `<span class="espaco"></span><button class="icone" data-acao="alternar-salva" aria-pressed="${salva}" aria-label="${salva ? 'Remover da coleção' : 'Salvar na coleção'}">${icone(salva ? 'estrela-cheia' : 'estrela')}</button>`,
      vazioMsg: vazio({ icone: 'nota', titulo: 'Sem músicas disponíveis', texto: 'Esta playlist não tem músicas que dê pra tocar aqui.' }),
    });
  } catch {
    if (!sinal.aborted) tela.innerHTML = erroPagina();
  }
}

export async function artistaTela({ tela, sinal, arg }) {
  tela.innerHTML = esqueletoPagina();
  try {
    const [a, faixas] = await Promise.all([audius.artista(arg[1], sinal), audius.faixasDoArtista(arg[1], 30, sinal)]);
    if (sinal.aborted) return;
    paginaColecao({
      tela, etiqueta: 'Artista', titulo: a.nome, capa: capaHtml(a.foto, a.id, 'colecao-capa redonda', a.espelhos), semDisco: true, faixas, bio: a.bio,
      sub: [a.seguidores ? `${fmtNumero(a.seguidores)} seguidores` : '', a.faixas ? plural(a.faixas, 'música', 'músicas') : ''].filter(Boolean).join(' · '),
      vazioMsg: vazio({ icone: 'nota', titulo: 'Nada pra tocar por aqui', texto: 'Este artista ainda não tem músicas disponíveis.' }),
    });
  } catch {
    if (!sinal.aborted) tela.innerHTML = erroPagina();
  }
}

const PERIODOS = [['week', 'Semana'], ['month', 'Mês'], ['allTime', 'Sempre']];

export async function generoTela({ tela, sinal, arg }) {
  const bruto = arg[1] || 'todos';
  const g = bruto === 'todos' ? '' : bruto;
  const periodo = PERIODOS.some(([v]) => v === arg[2]) ? arg[2] : 'week';
  const nome = g ? nomeGenero(g) : 'Em alta agora';
  tela.innerHTML = esqueletoPagina();
  try {
    const faixas = await audius.emAlta({ genero: g, limite: 50, periodo }, sinal);
    if (sinal.aborted) return;
    paginaColecao({
      tela, etiqueta: g ? 'Gênero' : 'Todos os gêneros', titulo: nome, sub: `${resumo(faixas)} · mais tocadas`, capa: capaHtml('', bruto, 'colecao-capa'), faixas,
      filtros: `<div class="chips" role="group" aria-label="Período">${PERIODOS.map(([v, n]) =>
        `<a class="chip" href="#/genero/${enc(bruto)}/${v}" ${v === periodo ? 'aria-current="true"' : ''}>${n}</a>`).join('')}</div>`,
      vazioMsg: vazio({ icone: 'nota', titulo: 'Nada em alta por aqui', texto: 'Tente outro período.' }),
    });
  } catch {
    if (!sinal.aborted) tela.innerHTML = erroPagina();
  }
}

// ---------- botões das telas ----------
export const acoesTelas = {
  'tocar-tudo': (el) => player.tocarLista(lista(el.dataset.lista), 0),
  'misturar-tudo': (el) => player.tocarLista(lista(el.dataset.lista), 0, { misturar: true }),
  'add-arquivos': () => document.getElementById('arquivos').click(),
  'limpar-busca': () => {
    const c = document.getElementById('q');
    c.value = '';
    c.dispatchEvent(new Event('input', { bubbles: true }));
    c.focus();
  },
  'busca-recente': (el) => { location.hash = `#/buscar/${enc(el.dataset.q)}`; },
  'apagar-busca': (el) => {
    store.apagarBusca(el.dataset.q);
    el.closest('.chip').remove();
    const caixa = document.querySelector('.recentes-busca');
    if (caixa && !caixa.children.length) { caixa.previousElementSibling?.remove(); caixa.remove(); }
  },
  'nova-playlist': async () => {
    const p = await novaPlaylist();
    if (p) location.hash = `#/playlist/${p.id}`;
  },
  'renomear-pl': async (el) => {
    const p = store.playlist(el.dataset.id);
    const nome = p && await perguntar({ titulo: 'Renomear playlist', campo: { rotulo: 'Nome da playlist', valor: p.nome }, ok: 'Salvar' });
    if (nome) store.renomearPlaylist(p.id, nome);
  },
  'excluir-pl': async (el) => {
    const p = store.playlist(el.dataset.id);
    if (!p) return;
    const ok = await perguntar({ titulo: `Excluir “${p.nome}”?`, texto: 'As músicas continuam onde estavam; só a playlist some.', ok: 'Excluir', perigo: true });
    if (!ok) return;
    store.excluirPlaylist(p.id);
    location.hash = '#/biblioteca';
    avisar('Playlist excluída');
  },
  'alternar-salva': () => {
    if (!colecaoAudius) return;
    avisar(store.alternarSalva(colecaoAudius) ? 'Salva na sua coleção' : 'Removida da sua coleção');
  },
};
