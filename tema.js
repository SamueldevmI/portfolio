/* Roda no <head>, sem defer: escolhe a folha de estilo antes de desenhar a página. Fica num arquivo (e não dentro
   do index.html) porque a política de segurança (CSP) só deixa rodar script que é arquivo do próprio site.
   O document.write funciona aqui porque este script é carregado de forma síncrona pelo HTML. */
/* Tema: vermelho (padrão) ou azul. Escolhido antes de desenhar a página, pra não piscar a cor errada.
   O style-azul.css é gerado a partir do style.css (ferramentas/gerar-tema-azul.js). */
(function () {
    var tema = "vermelho";
    try {
        var salvo = localStorage.getItem("portfolio-tema");
        if (!salvo && localStorage.getItem("tema") === "aranha") salvo = "azul"; // quem tinha escolhido o antigo tema Aranha
        if (salvo === "azul") tema = "azul";
    } catch (e) { /* sem armazenamento */ }
    document.documentElement.dataset.tema = tema;
    if (tema === "azul") document.querySelector('meta[name="theme-color"]').content = "#0e1422";
    document.write('<link rel="stylesheet" id="folhaTema" href="' + (tema === "azul" ? "style-azul.css" : "style.css") + '?v=20260930merge">');
})();
