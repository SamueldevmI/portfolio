// Ponto de partida: rotas (endereços com #), cliques da tela e inicialização.
import * as store from './store.js';
import * as player from './player.js';
import { carregarCapas, apagarTudoLocal } from './db.js';
import { icone, avisar, fecharFolha, folhaAberta, limparListas, lista, perguntar, fecharDialogo } from './ui.js';
import {
  inicio, buscar, biblioteca, curtidasTela, meusTela, playlistTela, playlistAudius, artistaTela, generoTela,
  garimpoTela, baixadasTela, importarTela, naoEncontrada, escolherChip, acoesTelas,
} from './telas.js';
import { sugerir } from './radio.js';
import { instalado, noIphone, pedirInstalacao } from './instalar.js';
import { montarPlayer, acoesPlayer } from './player-ui.js';
import { menuFaixa, acoesMenu } from './menus.js';
import { camadaAberta, fecharCamada } from './nav.js';
import { importar } from './importar.js';
import { iniciarLuzes, nivel, piscar, aplicarNivel, definirAba } from './luzes.js';

const tela = document.getElementById('tela');
history.scrollRestoration = 'manual';

let ctl = null;
let rotaAtual = null;
let reagendar = 0;

function partes() {
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').map((p) => { try { return decodeURIComponent(p); } catch { return p; } }) : [];
}

// cada rota diz qual tela desenhar, qual aba acender e de quais dados ela depende (pra redesenhar quando mudarem)
function achar([a, b]) {
  if (!a) return { f: inicio, aba: 'inicio', deps: ['config'] };
  if (a === 'buscar') return { f: buscar, aba: 'buscar' };
  if (a === 'biblioteca') return { f: biblioteca, aba: 'biblioteca', deps: ['playlists', 'salvas', 'meus', 'curtidas'] };
  if (a === 'curtidas') return { f: curtidasTela, aba: 'biblioteca', deps: ['curtidas'] };
  if (a === 'meus') return { f: meusTela, aba: 'biblioteca', deps: ['meus'] };
  if (a === 'playlist') return { f: playlistTela, aba: 'biblioteca', deps: ['playlists'] };
  if (a === 'audius' && b === 'playlist') return { f: playlistAudius, aba: 'inicio', deps: ['salvas'] };
  if (a === 'artista') return { f: artistaTela, aba: 'buscar' };
  if (a === 'genero') return { f: generoTela, aba: 'buscar' };
  if (a === 'garimpo') return { f: garimpoTela, aba: 'buscar' };
  if (a === 'baixadas') return { f: baixadasTela, aba: 'biblioteca', deps: ['baixadas'] };
  if (a === 'importar') return { f: importarTela, aba: 'biblioteca' };
  return { f: naoEncontrada, aba: 'inicio' };
}

export async function rotear({ manter = false } = {}) {
  ctl?.abort();
  ctl = new AbortController();
  const { signal: sinal } = ctl;
  if (!manter) fecharFolha();
  limparListas();
  const p = partes();
  const r = achar(p);
  rotaAtual = r;
  definirAba(r.aba); // cada aba empurra as luzes de fundo um pouco pro lado
  document.querySelectorAll('.aba').forEach((a) => {
    if (a.dataset.rota === r.aba) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const y = manter ? scrollY : 0;
  try {
    await r.f({ tela, sinal, arg: p });
  } catch (e) {
    if (!sinal.aborted) console.error(e);
  }
  if (!sinal.aborted) scrollTo(0, y);
}

// quando algo que a tela mostra muda (favoritas, playlists...), ela se redesenha no mesmo lugar
store.ouvir((t) => {
  if (rotaAtual?.deps?.includes(t)) {
    clearTimeout(reagendar);
    reagendar = setTimeout(() => rotear({ manter: true }), 60);
  }
});

// ---- instalar como app ----
addEventListener('appinstalled', () => avisar('Eldev Music instalado!'));
// quando o navegador libera a instalação, o atalho "Instalar o app" aparece na tela inicial
document.addEventListener('instalar:mudou', () => { if (rotaAtual?.aba === 'inicio' && !location.hash.slice(2)) rotear({ manter: true }); });

const EFEITOS = [
  ['completo', 'Completo', 'Luzes passeando lá atrás (a música rápida deixa elas mais ligeiras), brilho no disco e movimento ao mexer o mouse, inclinar o celular, rolar a lista ou trocar de tela'],
  ['suave', 'Suave', 'Só três luzes lentas no fundo. Gasta menos bateria'],
  ['desligado', 'Desligado', 'Sem luzes e sem movimento. É o mais leve'],
];

async function abrirConfig() {
  const atual = nivel();
  const piscando0 = piscar();
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const efeitos = `<fieldset class="efeitos"><legend>Efeitos de luz</legend>${EFEITOS.map(([v, nome, dica]) =>
    `<label><input type="radio" name="efeitos" value="${v}"${v === atual ? ' checked' : ''}><span>${nome}<small>${dica}</small></span></label>`).join('')}
    <label class="piscar"><input type="checkbox" name="piscar"${piscando0 ? ' checked' : ''}${atual === 'completo' ? '' : ' disabled'}><span>Piscar na batida<small>O fundo acende e apaga no ritmo da música. Só no Completo.</small></span></label>${
    parado ? '<small>Seu aparelho pede menos movimento, então as luzes ficam paradas.</small>' : ''}</fieldset>`;
  const extra = `${efeitos}<hr>
    ${instalado()
      ? '<small>Você está usando o Eldev Music instalado no aparelho.</small>'
      : `<button type="button" class="botao" data-acao="instalar">${icone('baixar')}Instalar o Eldev Music</button>${
        noIphone() ? '<small>No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.</small>' : ''}`}
    <hr>
    <small>Músicas grátis do Audius. Favoritas, playlists e arquivos ficam só neste aparelho.</small>
    <button type="button" class="botao perigo" data-acao="apagar-dados">Apagar meus dados</button>`;
  let escolhido = atual;
  let piscando = piscando0;
  const nome = await perguntar({
    titulo: 'Configurações', ok: 'Salvar', extra,
    campo: { rotulo: 'Seu nome', valor: store.config().nome, opcional: true, max: 30 },
    aoMudar: (form) => { // mostra o efeito na hora
      const n = form.elements.efeitos.value;
      form.elements.piscar.disabled = n !== 'completo';
      aplicarNivel(n, form.elements.piscar.checked);
    },
    aoSalvar: (form) => { escolhido = form.elements.efeitos.value; piscando = form.elements.piscar.checked; },
  });
  if (nome !== null) store.definirConfig({ nome, efeitos: escolhido, piscar: piscando });
  else aplicarNivel(); // cancelou: volta ao que estava salvo
}

// ---- cliques: cada botão traz data-acao="nome" e cai aqui ----
const acoes = {
  ...acoesPlayer,
  ...acoesMenu,
  ...acoesTelas,
  chip: (el) => { escolherChip(el.dataset.g); rotear({ manter: true }); },
  recarregar: () => rotear(),
  voltar: () => (history.length > 1 ? history.back() : (location.hash = '#/')),
  'fechar-folha': fecharFolha,
  tocar: (el) => player.tocarLista(lista(el.dataset.lista), +el.dataset.i),
  menu: (el) => {
    const f = lista(el.dataset.lista)[+el.dataset.i];
    if (f) menuFaixa(f, { playlistId: el.closest('[data-playlist]')?.dataset.playlist || '' });
  },
  config: abrirConfig,
  instalar: async () => {
    if (await pedirInstalacao()) return;
    avisar(noIphone() ? 'Toque em Compartilhar e em “Adicionar à Tela de Início”' : 'No menu do navegador, escolha “Instalar app”');
  },
  'apagar-dados': async () => {
    await fecharDialogo();
    const ok = await perguntar({
      titulo: 'Apagar tudo?', ok: 'Apagar tudo', perigo: true,
      texto: 'Favoritas, playlists, arquivos e histórico deste aparelho serão apagados. Isso não dá pra desfazer.',
    });
    if (!ok) return;
    player.pausar();
    try { await apagarTudoLocal(); } catch { /* sem IndexedDB */ }
    store.apagarTudo();
    location.hash = '#/';
    location.reload();
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-acao]');
  const fn = el && acoes[el.dataset.acao];
  if (!fn) return;
  e.preventDefault();
  fn(el, e);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (folhaAberta()) fecharFolha();
  else if (camadaAberta()) fecharCamada();
});

// ---- arquivos do próprio usuário: botão "Adicionar arquivos" ou arrastar pra janela ----
const entrada = document.getElementById('arquivos');
entrada.addEventListener('change', async () => {
  const escolhidos = [...entrada.files];
  entrada.value = '';
  await importar(escolhidos);
});
addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
addEventListener('drop', (e) => {
  if (!e.dataTransfer?.files?.length) return;
  e.preventDefault();
  importar([...e.dataTransfer.files]);
});

// imagem que falha: tenta o servidor reserva; se acabarem, some e deixa o degradê da capa aparecer
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName !== 'IMG') return;
  const reserva = (img.dataset.alt || '').split(' ').filter((m) => /^https:\/\/[^/\s]+$/.test(m));
  if (reserva.length) {
    const proximo = reserva.shift();
    img.dataset.alt = reserva.join(' ');
    try { img.src = proximo + new URL(img.src).pathname; return; } catch { /* endereço estranho: cai no remove */ }
  }
  img.remove();
}, true);

addEventListener('hashchange', () => rotear());

addEventListener('offline', () => avisar('Sem internet. As músicas baixadas e as do aparelho continuam tocando.'));
addEventListener('online', () => {
  avisar('A internet voltou');
  if (document.querySelector('[data-acao="recarregar"]')) rotear({ manter: true }); // tela que estava com erro tenta de novo
});

// ---- começo ----
player.definirRadio(sugerir); // a rádio infinita escolhe as próximas músicas com radio.js
iniciarLuzes(); // as luzes lá atrás (antes do player, pra ficarem por baixo de tudo)
montarPlayer();
await Promise.race([carregarCapas(), new Promise((ok) => setTimeout(ok, 800))]);
player.restaurar();
rotear();
