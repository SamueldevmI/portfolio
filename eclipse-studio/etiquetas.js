"use strict";
/* Etiquetas com QR pra imprimir (feira, bazar, arara): abra a loja com ?etiquetas
   (https://samueldevmi.github.io/portfolio/eclipse-studio/?etiquetas). Cada etiqueta tem nome, preço, código
   e um QR que abre a peça direto na loja, marcando a origem "etiqueta" no pedido (?de=etiqueta).
   Usa o catálogo de verdade (o da planilha, quando estiver ligada). Fora do ?etiquetas, este arquivo não faz nada. */
(function etiquetas() {
    if (!new URLSearchParams(location.search).has("etiquetas")) return;
    const raiz = document.documentElement;
    raiz.classList.add("modo-etiquetas");
    const caixa = document.createElement("main");
    caixa.className = "etiquetas";
    document.body.appendChild(caixa);
    let mostrar = "todas";

    const urlDaPeca = (id) => `${location.origin}${location.pathname}?de=etiqueta#peca-${encodeURIComponent(id)}`;
    function qrSvg(texto) {
        if (typeof qrcode !== "function") return "";
        const qr = qrcode(0, "M");
        qr.addData(texto);
        qr.make();
        const n = qr.getModuleCount();
        let d = "";
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
        return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" aria-hidden="true"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    }
    function desenhar() {
        const pecas = PRODUTOS.filter((p) => naVitrine(p) && disponivel(p) && p.id !== "caixa" && (mostrar === "todas" || p.novo));
        caixa.innerHTML = `<div class="etq-barra">
                <p><b>Etiquetas com QR</b> · ${pecas.length} ${pecas.length === 1 ? "peça" : "peças"}. A cliente aponta a câmera e cai na peça, pronta pra pôr na sacola.</p>
                <div class="etq-acoes">
                    <button type="button" data-mostrar="todas" aria-pressed="${mostrar === "todas"}">Todas</button>
                    <button type="button" data-mostrar="novas" aria-pressed="${mostrar === "novas"}">Só novidades</button>
                    <button type="button" class="etq-imprimir" data-imprimir>Imprimir</button>
                    <a href="${location.pathname}">Voltar pra loja</a>
                </div>
                ${LOJA.demo ? '<p class="etq-demo">⚠ A vitrine ainda tem peças de exemplo: imprima pra testar, as de verdade saem quando as peças reais entrarem.</p>' : ""}
            </div>
            <div class="etq-folha">${pecas.map((p) => `<article class="etq">
                <div class="etq-texto">
                    <p class="etq-marca">${LOJA.nome}</p>
                    <h2>${p.nome.replace(/[<>&]/g, "")}</h2>
                    <p class="etq-preco">${precoTexto(p)}</p>
                    <p class="etq-cod">${codigo(p.id)}${p.unica ? " · peça única" : ""}</p>
                </div>
                <div class="etq-qr">${qrSvg(urlDaPeca(p.id))}<small>aponte a câmera</small></div>
            </article>`).join("")}</div>`;
    }
    caixa.addEventListener("click", (e) => {
        const m = e.target.closest("[data-mostrar]");
        if (m) { mostrar = m.dataset.mostrar; desenhar(); }
        if (e.target.closest("[data-imprimir]")) window.print();
    });
    // a biblioteca do QR é a mesma do gerador grátis do portfólio
    const s = document.createElement("script");
    s.src = "../qr/qrcode.js";
    s.onload = desenhar;
    document.head.appendChild(s);
    document.addEventListener("catalogo:atualizado", desenhar);
})();
