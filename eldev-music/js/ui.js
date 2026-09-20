// Peças de tela que várias telas usam: ícone, capa, linha de música, cartão, aviso, menu de baixo, diálogo.
import { esc, gradientePorId, fmtTempo, urlSegura } from './util.js';
import { capaDe } from './db.js';

export const icone = (nome, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${nome}"/></svg>`;

// Os botões da tela só carregam uma chave (L1, L2...) e a posição; a lista de verdade fica guardada aqui.
const listas = new Map();
let seq = 0;
export function registrar(arr) {
  const k = `L${++seq}`;
  listas.set(k, arr);
  return k;
}
export const lista = (k) => listas.get(k) || [];
export const limparListas = () => listas.clear();

export const capaPeq = (f) => capaDe(f).replace('480x480', '150x150');

// `alt` = servidores reserva; se a imagem falhar, o app tenta o próximo (ver o tratador de erro no app.js)
// `dentro` = html extra que fica por cima da imagem (ex.: número do ranking)
export function capaHtml(url, semente = '', cls = '', alt = [], dentro = '') {
  const u = urlSegura(url);
  const reserva = alt.length ? ` data-alt="${esc(alt.join(' '))}"` : '';
  const img = u ? `<img src="${esc(u)}" alt="" loading="lazy" decoding="async"${reserva}>` : '';
  return `<span class="capa ${cls}" style="--g:${gradientePorId(semente || url || 'x')}">${icone('nota')}<i class="eq"><b></b><b></b><b></b></i>${img}${dentro}</span>`;
}

// a capa como disco de vinil (gira enquanto a música toca)
export function discoHtml(url, semente = '', alt = []) {
  const u = urlSegura(url);
  const reserva = alt.length ? ` data-alt="${esc(alt.join(' '))}"` : '';
  const img = u ? `<img src="${esc(u)}" alt="" decoding="async"${reserva}>` : '';
  return `<span class="disco" style="--g:${gradientePorId(semente || url || 'x')}">${icone('nota')}${img}<i class="furo"></i></span>`;
}

export function linhaFaixa(f, chave, i, { duracao = false } = {}) {
  const t = esc(f.titulo);
  return `<div class="faixa" data-id="${esc(f.id)}">
    <button class="faixa-tocar" data-acao="tocar" data-lista="${chave}" data-i="${i}" aria-label="Tocar ${t}, de ${esc(f.artista)}">
      ${capaHtml(capaPeq(f), f.id, '', f.espelhos || [])}
      <span class="faixa-txt"><b>${t}</b><span>${esc(f.artista)}${duracao && f.duracao ? ` · ${fmtTempo(f.duracao)}` : ''}</span></span>
    </button>
    <button class="mais" data-acao="menu" data-lista="${chave}" data-i="${i}" aria-label="Mais opções para ${t}">${icone('mais')}</button>
  </div>`;
}

// `rank` = mostra o número da posição no canto da capa (paradas)
export function cartaoFaixa(f, chave, i, { rank = false } = {}) {
  return `<button class="cartao" data-id="${esc(f.id)}" data-acao="tocar" data-lista="${chave}" data-i="${i}" aria-label="${rank ? `${i + 1}º lugar: ` : ''}Tocar ${esc(f.titulo)}, de ${esc(f.artista)}">
    ${capaHtml(capaDe(f), f.id, '', f.espelhos || [], rank ? `<b class="rank" aria-hidden="true">${i + 1}</b>` : '')}
    <span class="cartao-t">${esc(f.titulo)}</span><span class="cartao-s">${esc(f.artista)}</span>
  </button>`;
}

// cartão largo com o título em cima da imagem (playlists)
export function cartaoPaisagem({ href, capa, semente, titulo, sub, espelhos = [] }) {
  const texto = `<i class="veu"></i><span class="sobre"><b>${esc(titulo)}</b><span>${esc(sub || '')}</span></span>`;
  return `<a class="cartao paisagem" href="${esc(href)}" aria-label="${esc(titulo)}">${capaHtml(capa, semente || titulo, '', espelhos, texto)}</a>`;
}

export function cartaoLink({ href, capa, semente, titulo, sub, redondo = false, espelhos = [] }) {
  return `<a class="cartao ${redondo ? 'redondo' : ''}" href="${esc(href)}">
    ${capaHtml(capa, semente || titulo, redondo ? 'redonda' : '', espelhos)}
    <span class="cartao-t">${esc(titulo)}</span><span class="cartao-s">${esc(sub || '')}</span>
  </a>`;
}

export const esqueleto = (n = 6) => Array.from({ length: n }, () => '<div class="esq"><i></i><u></u></div>').join('');

export function vazio({ icone: ic = 'nota', titulo, texto = '', botao = null }) {
  return `<div class="vazio">${icone(ic)}<h2>${esc(titulo)}</h2>${texto ? `<p>${esc(texto)}</p>` : ''}${
    botao ? `<button class="botao primario" data-acao="${botao.acao}">${esc(botao.rotulo)}</button>` : ''}</div>`;
}

// ---- aviso rápido (toast) ----
export function avisar(texto, acao = null) {
  const caixa = document.getElementById('avisos');
  const el = document.createElement('div');
  el.className = 'aviso';
  el.append(document.createTextNode(texto));
  if (acao) {
    const b = document.createElement('button');
    b.textContent = acao.rotulo;
    b.onclick = () => { acao.fn(); el.remove(); };
    el.append(b);
  }
  caixa.append(el);
  while (caixa.children.length > 2) caixa.firstChild.remove();
  setTimeout(() => el.remove(), acao ? 5500 : 3000);
}

// ---- menu que sobe de baixo ----
let focoAntes = null;
const dados = (o = {}) => Object.entries(o).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
const itemHtml = (it) => it === '-'
  ? '<hr class="item-sep">'
  : `<button class="item ${it.cls || ''}" data-acao="${it.acao}"${dados(it.dados)}>${it.icone ? icone(it.icone) : ''}<span>${esc(it.texto)}</span>${it.marca ? icone('check', 'marca') : ''}</button>`;

// `tipo` deixa reabrir o mesmo menu (ex.: a fila, quando muda) sem perder onde a pessoa rolou
export function abrirFolha({ cabeca = '', itens = [], corpo = '', rotulo = 'Opções', tipo = '' }) {
  const f = document.getElementById('folha');
  const mesmo = !f.hidden && tipo && f.dataset.tipo === tipo;
  const rolagem = mesmo ? f.querySelector('.folha-painel')?.scrollTop || 0 : 0;
  if (f.hidden) focoAntes = document.activeElement;
  f.dataset.tipo = tipo;
  f.innerHTML = `<div class="folha-fundo" data-acao="fechar-folha"></div>
    <div class="folha-painel" role="dialog" aria-modal="true" aria-label="${esc(rotulo)}" tabindex="-1">
      ${cabeca}${corpo}${itens.map(itemHtml).join('')}
    </div>`;
  f.hidden = false;
  const painel = f.querySelector('.folha-painel');
  painel.scrollTop = rolagem;
  if (!mesmo) painel.focus({ preventScroll: true });
}

export const folhaAberta = () => !document.getElementById('folha').hidden;

export function fecharFolha() {
  const f = document.getElementById('folha');
  if (f.hidden) return;
  f.hidden = true;
  f.innerHTML = '';
  if (focoAntes?.isConnected) focoAntes.focus({ preventScroll: true });
  focoAntes = null;
}

export const cabecaFolha = (capaUrl, semente, titulo, sub, alt = []) =>
  `<div class="folha-cabeca">${capaHtml(capaUrl, semente, '', alt)}<div><b>${esc(titulo)}</b><span>${esc(sub)}</span></div></div>`;

// fecha o diálogo aberto e espera ele terminar de fechar (pra poder abrir outro em seguida)
export function fecharDialogo() {
  const d = document.getElementById('dialogo');
  if (!d.open) return Promise.resolve();
  return new Promise((ok) => {
    d.addEventListener('close', ok, { once: true });
    d.close('cancel');
  });
}

// ---- diálogo (no lugar de prompt/confirm, que ficam feios e bloqueados no app instalado) ----
export function perguntar({ titulo, texto = '', campo = null, ok = 'Salvar', perigo = false, extra = '' }) {
  const d = document.getElementById('dialogo');
  d.innerHTML = `<form method="dialog" class="dialogo-form">
    <h2>${esc(titulo)}</h2>
    ${texto ? `<p>${esc(texto)}</p>` : ''}
    ${campo ? `<label class="campo"><span>${esc(campo.rotulo)}</span><input name="v" value="${esc(campo.valor || '')}" maxlength="${campo.max || 60}" autocomplete="off"${campo.opcional ? '' : ' required'}></label>` : ''}
    ${extra}
    <div class="dialogo-botoes">
      <button type="button" class="botao" data-fechar>${ok ? 'Cancelar' : 'Fechar'}</button>
      ${ok ? `<button class="botao ${perigo ? 'perigo' : 'primario'}" value="ok">${esc(ok)}</button>` : ''}
    </div>
  </form>`;
  const form = d.querySelector('form');
  return new Promise((res) => {
    d.querySelector('[data-fechar]').onclick = () => d.close('cancel');
    d.onclose = () => {
      const okay = d.returnValue === 'ok';
      d.returnValue = '';
      res(okay ? (campo ? form.elements.v.value.trim() : true) : campo ? null : false);
    };
    d.showModal();
    form.elements.v?.select();
  });
}
