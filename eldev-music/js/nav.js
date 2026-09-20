// Navegação: o player em tela cheia conta como uma "página" do histórico,
// assim o botão Voltar do celular fecha o player em vez de sair do app.
import { fecharFolha } from './ui.js';

let camada = null;   // { fechar } enquanto o player cheio está aberto
let destino = null;  // endereço pra abrir logo depois de fechar a camada

export const camadaAberta = () => !!camada;

export function abrirCamada(fechar) {
  camada = { fechar };
  history.pushState({ camada: 1 }, '');
}

export function fecharCamada() {
  if (camada) history.back();
}

// vai pra um endereço do app; se o player cheio estiver aberto, fecha ele primeiro
export function navegar(hash) {
  if (camada) { destino = hash; history.back(); } else location.hash = hash;
}

addEventListener('popstate', () => {
  fecharFolha();
  if (!camada) return;
  const c = camada;
  camada = null;
  c.fechar();
  if (destino) {
    const d = destino;
    destino = null;
    location.hash = d;
  }
});
