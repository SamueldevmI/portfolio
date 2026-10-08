/* Faixa "edição especial" no topo das páginas de projeto, linkando de volta pro portfólio
   principal. Script único, incluído com <script src="../selo-gibi.js" defer></script>: ele mesmo
   descobre o caminho de volta pela própria tag (conta quantos "../" tem no src). Fica em fluxo
   normal (não fixo) de propósito, pra nunca cobrir nada da página — cada projeto já tem seus
   próprios botões flutuantes nos cantos. Se algo falhar aqui, o resto da página segue igual. */
(function () {
    "use strict";
    if (document.querySelector(".gibi-selo")) return;
    var src = (document.currentScript && document.currentScript.getAttribute("src")) || "../selo-gibi.js";
    var m = src.match(/^(\.\.\/)+/);
    var voltar = m ? m[0] : "../";

    var a = document.createElement("a");
    a.className = "gibi-selo";
    a.href = voltar + "index.html#projetos";
    a.innerHTML = '<b>#1</b><span>edição especial · ver o portfólio completo</span><i aria-hidden="true">→</i>';

    var s = document.createElement("style");
    s.textContent = ".gibi-selo{display:flex;align-items:center;justify-content:center;gap:8px;"
        + 'padding:7px 14px;background:#ffe14d;color:#111;font:600 .74rem/1.3 "Space Grotesk",Arial,sans-serif;'
        + "text-decoration:none;border-bottom:2px solid #111}"
        + '.gibi-selo b{font:400 .95rem/1 "Bangers",Impact,sans-serif;letter-spacing:.02em}'
        + "@media (hover:hover){.gibi-selo:hover{background:#ffd700}}"
        + ".gibi-selo:focus-visible{outline:3px solid #111;outline-offset:-3px}"
        + "@media (max-width:480px){.gibi-selo span{display:none}}"
        + "@media print{.gibi-selo{display:none}}";
    document.head.appendChild(s);
    document.body.insertBefore(a, document.body.firstChild);
})();
