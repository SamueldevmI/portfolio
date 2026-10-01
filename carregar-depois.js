/* Fica num arquivo (e não dentro do index.html) por causa da política de segurança (CSP). */
/* Scripts que a página não precisa pra aparecer: o mobile.js só baixa em tela de toque (no computador
   ele não faz nada) e a música só depois que a página terminou de carregar. */
(function () {
    var versao = "?v=20260930merge";
    function carregar(arquivo) { var s = document.createElement("script"); s.src = arquivo + versao; document.body.appendChild(s); }
    if (matchMedia("(pointer: coarse)").matches) {
        // o pedido de "instalar app" pode chegar antes do mobile.js: fica guardado pra ele usar
        addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.pedidoInstalar = e; });
        carregar("mobile.js");
    }
    function depois() { (window.requestIdleCallback || setTimeout)(function () { carregar("musica.js"); }); }
    if (document.readyState === "complete") depois(); else addEventListener("load", depois, { once: true });
})();
