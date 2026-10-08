/* O celular da prévia ("Esse poderia ser o site da Sua Pizzaria"): os dados de cada ramo e o HTML do aparelho.
   Usado pelo portfólio (vitrine do topo e prévia), pela apresentação e pelas páginas por ramo.
   O visual fica no style.css (.previa-*). Funciona no navegador (window.PreviaCelular) e no Node (require). */
(function (raiz, fabrica) {
    const api = fabrica();
    if (typeof module === "object" && module.exports) module.exports = api;
    else raiz.PreviaCelular = api;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";
    const RAMOS = {
        pizzaria: { rotulo: "pizzaria", exemplo: "Sua Pizzaria", emoji: "🍕", cor: "#f08a24", fundo: "#1c1311", texto: "#fff4ee", suave: "#c9a99c",
            chamada: "A pizza que chega quentinha", sub: "Forno a lenha · entrega em Campo Grande", secao: "Cardápio",
            itens: [["Calabresa", "R$ 45"], ["Frango com catupiry", "R$ 49"], ["Portuguesa", "R$ 52"]],
            info: "Ter a dom · 18h às 23h30", chips: ["Borda recheada", "Entrega grátis até 5 km"], botao: "Pedir pelo WhatsApp" },
        barbearia: { rotulo: "barbearia", exemplo: "Sua Barbearia", emoji: "💈", cor: "#c8a15a", fundo: "#121212", texto: "#f5efe3", suave: "#a39a88",
            chamada: "Corte na régua, sem fila", sub: "Escolha o horário em 2 toques", secao: "Serviços",
            itens: [["Corte", "R$ 35"], ["Barba", "R$ 25"], ["Corte + barba", "R$ 55"]],
            info: "Horários livres hoje", chips: ["16h30", "18h", "19h30"], botao: "Agendar horário" },
        "loja de roupa": { rotulo: "loja", exemplo: "Sua Loja", emoji: "👗", cor: "#ff5c8a", fundo: "#141014", texto: "#fdf0f4", suave: "#b89aa4",
            chamada: "Nova coleção chegou", sub: "Enviamos pra todo o MS", secao: "Destaques",
            itens: [["Vestido midi", "R$ 129"], ["Moletom oversized", "R$ 189"], ["Boné bordado", "R$ 79"]],
            info: "Tamanhos", chips: ["P", "M", "G", "GG"], botao: "Comprar pelo WhatsApp" },
        "salão": { rotulo: "salão", exemplo: "Seu Salão", emoji: "💇‍♀️", cor: "#e58fb4", fundo: "#1a1216", texto: "#fdeff5", suave: "#bf9fae",
            chamada: "Seu cabelo do jeito que você sonhou", sub: "Agende sem precisar mandar mensagem", secao: "Serviços",
            itens: [["Escova", "R$ 50"], ["Progressiva", "a partir de R$ 180"], ["Unhas", "R$ 35"]],
            info: "Horários livres amanhã", chips: ["10h", "14h", "16h"], botao: "Agendar horário" },
        academia: { rotulo: "academia", exemplo: "Sua Academia", emoji: "🏋️", cor: "#f5c518", fundo: "#0f0f0f", texto: "#fbf7e6", suave: "#a8a28a",
            chamada: "Bora treinar?", sub: "Aula experimental grátis", secao: "Planos",
            itens: [["Mensal", "R$ 99"], ["Trimestral", "R$ 89/mês"], ["Anual", "R$ 79/mês"]],
            info: "Seg a sex 5h às 23h · sáb e dom 8h às 12h", chips: ["Musculação", "Funcional", "Spinning"], botao: "Agendar aula experimental" },
        "clínica": { rotulo: "clínica", exemplo: "Sua Clínica", emoji: "🩺", cor: "#1f9e8f", fundo: "#f3faf9", texto: "#12302c", suave: "#5b7a76",
            chamada: "Cuidado de verdade, perto de você", sub: "Agende sua consulta online", secao: "Especialidades",
            itens: [["Clínico geral", "seg a sex"], ["Pediatria", "ter e qui"], ["Dermatologia", "qua"]],
            info: "Convênios", chips: ["Unimed", "Bradesco Saúde", "Particular"], botao: "Agendar consulta" },
    };
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const endereco = (nome) => (nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "") || "seunegocio") + ".com.br";
    const iniciais = (nome) => nome.split(/\s+/).filter((p) => p.length > 2 || /^[A-Z]/.test(p)).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || nome[0].toUpperCase();

    // o celular com o mini-site (usado na prévia e na vitrine do topo)
    const ICONES_STATUS = '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
        + '<svg viewBox="0 0 16 12"><path d="M8 2.2c2.6 0 4.9 1 6.6 2.7l1.2-1.3A11 11 0 0 0 8 .4 11 11 0 0 0 .2 3.6l1.2 1.3A9.2 9.2 0 0 1 8 2.2zm0 3.6c1.6 0 3 .6 4.1 1.6l1.2-1.3A7.6 7.6 0 0 0 8 4a7.6 7.6 0 0 0-5.3 2.1l1.2 1.3c1.1-1 2.5-1.6 4.1-1.6zm0 3.6c.6 0 1.2.2 1.6.6L8 11.8 6.4 10c.4-.4 1-.6 1.6-.6z"/></svg>'
        + '<svg class="previa-bateria" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2.2" y="2.2" width="17" height="8.6" rx="2"/><path d="M25 4.4v4.2a2.2 2.2 0 0 0 0-4.2z" opacity=".45"/></svg>';
    const ICONE_WHATS = "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41z";
    function celular(ramo, marca) {
        const r = RAMOS[ramo];
        return `
                <div class="previa-celular" style="--p-cor:${r.cor};--p-fundo:${r.fundo};--p-texto:${r.texto};--p-suave:${r.suave}">
                    <div class="previa-tela">
                        <div class="previa-status" aria-hidden="true"><span>9:41</span><span class="previa-ilha"></span><span class="previa-icones">${ICONES_STATUS}</span></div>
                        <div class="previa-url"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2.5"/></svg>${esc(endereco(marca))}</div>
                        <div class="previa-site">
                            <header class="previa-topo"><span class="previa-logo">${esc(iniciais(marca))}</span><b>${esc(marca)}</b><span class="previa-menu" aria-hidden="true"><i></i><i></i><i></i></span></header>
                            <section class="previa-hero">
                                <div class="previa-capa" aria-hidden="true"><span class="previa-capa-emoji">${r.emoji}</span><span class="previa-nota">★ 4,9</span><span class="previa-aberto">aberto agora</span></div>
                                <h4>${esc(r.chamada)}</h4><p>${esc(r.sub)}</p><button type="button" class="previa-botao">${esc(r.botao)}</button>
                            </section>
                            <section class="previa-secao"><h5>${esc(r.secao)}</h5>${r.itens.map(([n, v]) => `<div class="previa-item"><span class="previa-miniatura" aria-hidden="true">${r.emoji}</span><span class="previa-item-nome">${esc(n)}</span><b>${esc(v)}</b></div>`).join("")}</section>
                            <section class="previa-secao"><h5>${esc(r.info)}</h5><div class="previa-chips">${r.chips.map((c) => `<button type="button">${esc(c)}</button>`).join("")}</div></section>
                            <footer class="previa-rodape">📍 Campo Grande - MS · ⭐ 4,9 no Google</footer>
                            <span class="previa-whats" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${ICONE_WHATS}"/></svg></span>
                        </div>
                        <span class="previa-home" aria-hidden="true"></span>
                    </div>
                    <p class="previa-aviso" role="status"></p>
                </div>`;
    }

    return { RAMOS, esc, endereco, iniciais, celular };
});
