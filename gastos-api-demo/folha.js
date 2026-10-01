/* Mesmo tema escolhido no portfólio (vermelho ou azul). Roda no <head>, sem defer, pra escolher a folha de estilo
   antes de desenhar a página. Fica num arquivo por causa da política de segurança (CSP) do index.html. */
(function () {
    var azul = false;
    try { azul = localStorage.getItem("portfolio-tema") === "azul"; } catch (e) { /* sem armazenamento */ }
    document.documentElement.dataset.tema = azul ? "azul" : "vermelho";
    document.write('<link rel="stylesheet" id="folhaTema" href="../' + (azul ? "style-azul.css" : "style.css") + '">');
})();
