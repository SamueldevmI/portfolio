// Instalar como app: guarda o pedido do navegador pra mostrar o botão na hora certa.
let evento = null;

export const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const noIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const podeInstalar = () => !!evento && !instalado();

addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  evento = e;
  document.dispatchEvent(new Event('instalar:mudou'));
});
addEventListener('appinstalled', () => {
  evento = null;
  document.dispatchEvent(new Event('instalar:mudou'));
});

// devolve false quando o navegador não deixa instalar por aqui (aí mostramos como fazer na mão)
export async function pedirInstalacao() {
  if (!evento) return false;
  evento.prompt();
  await evento.userChoice.catch(() => {});
  evento = null;
  document.dispatchEvent(new Event('instalar:mudou'));
  return true;
}
