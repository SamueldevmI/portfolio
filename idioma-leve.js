/* O idioma.js tem as traduções inteiras (mais de 100 KB) e quase todo mundo lê em português. Este arquivo
   pequeno põe o botão "ES" no menu e só baixa o idioma.js quando alguém pede o espanhol, ou de cara
   quando o aparelho/escolha anterior já é espanhol (decidido no <head>, em data-idioma). */
(function () {
    "use strict";
    var versao = (document.currentScript && document.currentScript.src.split("?")[1]) || "";
    var carregou = false;
    function carregar(depois) {
        if (carregou) return;
        carregou = true;
        var s = document.createElement("script");
        s.src = "idioma.js" + (versao ? "?" + versao : "");
        if (depois) s.addEventListener("load", depois);
        document.body.appendChild(s);
    }
    if (document.documentElement.dataset.idioma === "es") { carregar(); return; }
    var nav = document.querySelector(".nav");
    if (!nav) { carregar(); return; }
    // mesmo botão que o idioma.js cria (ele substitui este quando carrega)
    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-som botao-idioma";
    botao.textContent = "ES";
    botao.setAttribute("aria-label", "Mudar para espanhol");
    botao.title = "Mudar para espanhol";
    var tema = document.getElementById("botaoTema");
    if (tema) nav.insertBefore(botao, tema); else nav.appendChild(botao);
    botao.addEventListener("click", function () {
        try { localStorage.setItem("portfolio-idioma", "es"); } catch (e) { /* sem armazenamento */ }
        botao.disabled = true;
        botao.textContent = "…";
        carregar(function () {
            botao.remove();
            // sem armazenamento o idioma.js abre em português: aperta o botão dele pra trocar
            if (document.documentElement.lang !== "es") { var oficial = document.getElementById("botaoIdioma"); if (oficial) oficial.click(); }
        });
    });
})();
