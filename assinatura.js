/* Assinatura discreta no rodapé dos sites de clientes: "Site feito por Samuel Mickael ↗".
   Cada site entregue vira uma vitrine do portfólio. Uso, no fim da página do cliente:
     <script src="https://samueldevmi.github.io/portfolio/assinatura.js" data-cliente="eclipse" defer></script>
   - entra no fim do último <footer> (ou do <body>, se não tiver), herdando a cor do site;
   - o link leva ?origem=assinatura&de=<cliente>: o orçamento abre com "Vim pelo site de um cliente seu"
     e o painel conta de qual site veio;
   - o cliente pode pedir pra tirar a qualquer momento (está no contrato): é só apagar a linha do script.
   Arquivo independente: não usa nada do portfólio e, se falhar, o site do cliente segue igual. */
(function () {
    "use strict";
    if (document.querySelector(".assinatura-samuel")) return;
    var tag = document.currentScript;
    var cliente = (tag && tag.getAttribute("data-cliente")) || "";
    var url = "https://samueldevmi.github.io/portfolio/?origem=assinatura" + (cliente ? "&de=" + encodeURIComponent(cliente) : "");
    var tr = function (t) { return window.traduzir ? window.traduzir(t) : t; };

    function montar() {
        var p = document.createElement("p");
        p.className = "assinatura-samuel";
        var a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        var texto = document.createElement("span");
        texto.textContent = tr("Site feito por");
        var nome = document.createElement("b");
        nome.textContent = "Samuel Mickael";
        a.append(texto, " ", nome, " ↗");
        p.appendChild(a);
        var estilo = document.createElement("style");
        estilo.textContent = ".assinatura-samuel{margin:18px auto 0;padding:10px 16px 14px;text-align:center;font:500 .76rem/1.4 system-ui,sans-serif;opacity:.7}"
            + ".assinatura-samuel a{color:inherit;text-decoration:none;border-bottom:1px dotted currentColor}"
            + ".assinatura-samuel a:hover,.assinatura-samuel a:focus-visible{opacity:1;border-bottom-style:solid}"
            + ".assinatura-samuel b{font-weight:700}";
        var rodapes = document.querySelectorAll("footer");
        var onde = rodapes.length ? rodapes[rodapes.length - 1] : document.body;
        onde.appendChild(estilo);
        onde.appendChild(p);
        document.addEventListener("idiomaMudou", function () { texto.textContent = tr("Site feito por"); });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
    else montar();
})();
