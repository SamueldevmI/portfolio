"use strict";
/* Boneca de papel: a cliente veste a boneca com as peças da loja, arruma arrastando e salva pro story.
   Usa o que script.js e magia.js já deixaram pronto (PRODUTOS, arte(), imagemDaArte(), pintarFundoStory()…). */

/* a boneca (sem roupa nenhuma é só a anágua de papel), traço tracejado de "recorte aqui" */
const BONECA_SVG = `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="306" rx="46" ry="8" fill="#0b0610" opacity=".45"/>
    <path d="M68 44C62 4 138 4 132 44L140 128C120 138 80 138 60 128Z" fill="#241a33"/>
    <g fill="#f4ead6" stroke="#8a5a2b" stroke-width="2" stroke-dasharray="5 3" stroke-linejoin="round">
        <path d="M74 84Q58 122 60 176L70 177Q70 128 82 98Z"/><path d="M126 84Q142 122 140 176L130 177Q130 128 118 98Z"/>
        <path d="M86 150L80 294L94 294L99 160Z"/><path d="M114 150L120 294L106 294L101 160Z"/>
        <rect x="91" y="62" width="18" height="22" rx="4"/>
        <path d="M72 84Q100 76 128 84L134 152Q100 162 66 152Z"/>
        <ellipse cx="100" cy="42" rx="22" ry="26"/>
    </g>
    <path d="M77 36C82 12 118 12 123 36C113 27 87 27 77 36Z" fill="#241a33"/>
    <g fill="none" stroke="#241a33" stroke-width="2" stroke-linecap="round"><path d="M88 46q4 3 8 0M104 46q4 3 8 0"/><path d="M96 56q4 2 8 0"/></g>
    <circle cx="86" cy="52" r="3.5" fill="#ffb8d9" opacity=".7"/><circle cx="114" cy="52" r="3.5" fill="#ffb8d9" opacity=".7"/>
</svg>`;
/* onde cada tipo de peça cai na boneca: centro (x, y) e largura, em % do palco */
const LUGAR_NA_BONECA = { "Roupas": [50, 40, 46], "Joias e bijuterias": [50, 24, 20], "Bolsas": [76, 52, 24], "Maquiagem e perfumes": [24, 66, 16] };

(function boneca() {
    const palco = document.getElementById("bonecaPalco");
    if (!palco) return;
    const lista = document.getElementById("bonecaPecas");
    const controles = document.getElementById("bonecaControles");
    const nomeSel = document.getElementById("bonecaSelecionada");
    const totalEl = document.getElementById("bonecaTotal");
    const CHAVE = "es-boneca";
    const podeVestir = (p) => p && naVitrine(p) && disponivel(p);
    let vestidas = (ler(CHAVE, []) || []).filter((v) => podeVestir(produto(v.id)));
    let selecionada = null;

    const salvar = () => guardar(CHAVE, vestidas);
    const limitar = (v, min, max) => Math.max(min, Math.min(max, v));

    function renderPalco() {
        palco.innerHTML = BONECA_SVG + vestidas.map((v, i) => {
            const p = produto(v.id);
            return `<button type="button" class="boneca-peca${v.id === selecionada ? " selecionada" : ""}" data-peca="${v.id}" style="left:${v.x}%;top:${v.y}%;width:${v.w}%;z-index:${i + 1}" aria-label="${esc(p.nome)}: arraste pra mover, setas também movem">${arte(p)}</button>`;
        }).join("");
        const sel = vestidas.find((v) => v.id === selecionada);
        controles.hidden = !sel;
        if (sel) nomeSel.textContent = produto(sel.id).nome;
    }
    function renderLista() {
        lista.innerHTML = PRODUTOS.filter(podeVestir).map((p) => {
            const vestida = vestidas.some((v) => v.id === p.id);
            return `<li><button type="button" data-vestir="${p.id}" aria-pressed="${vestida}"><span class="tom-${p.tom}">${arte(p)}</span><small>${esc(p.nome)}</small></button></li>`;
        }).join("");
        const total = vestidas.reduce((s, v) => s + (produto(v.id).preco ?? 0), 0);
        const consulta = vestidas.some((v) => produto(v.id).preco == null);
        totalEl.textContent = vestidas.length ? `Look com ${vestidas.length} ${vestidas.length === 1 ? "peça" : "peças"}: ${brl(total)}${consulta ? " + itens a combinar" : ""}` : "A boneca está só de anágua. Escolha uma peça ✦";
    }
    const render = () => { renderPalco(); renderLista(); };

    function vestir(id) {
        const ja = vestidas.findIndex((v) => v.id === id);
        if (ja >= 0) {
            vestidas.splice(ja, 1);
            if (selecionada === id) selecionada = null;
        } else {
            const p = produto(id);
            const [x, y, w] = LUGAR_NA_BONECA[p.cat] || [50, 50, 30];
            const mesmas = vestidas.filter((v) => produto(v.id).cat === p.cat).length;
            vestidas.push({ id, x: limitar(x + mesmas * 6, 8, 92), y: limitar(y + mesmas * 5, 8, 92), w });
            selecionada = id;
        }
        salvar();
        render();
    }
    lista.addEventListener("click", (e) => { const b = e.target.closest("[data-vestir]"); if (b) vestir(b.dataset.vestir); });

    /* arrastar (mouse e dedo) */
    let arrasto = null;
    palco.addEventListener("pointerdown", (e) => {
        const b = e.target.closest(".boneca-peca");
        if (!b) { if (selecionada) { selecionada = null; renderPalco(); } return; }
        e.preventDefault();
        selecionada = b.dataset.peca;
        palco.querySelectorAll(".boneca-peca").forEach((x) => x.classList.toggle("selecionada", x === b));
        controles.hidden = false;
        nomeSel.textContent = produto(selecionada).nome;
        const v = vestidas.find((x) => x.id === selecionada);
        const r = palco.getBoundingClientRect();
        arrasto = { b, v, r, dx: e.clientX - (r.left + v.x / 100 * r.width), dy: e.clientY - (r.top + v.y / 100 * r.height) };
        b.setPointerCapture(e.pointerId);
    });
    palco.addEventListener("pointermove", (e) => {
        if (!arrasto) return;
        const { b, v, r, dx, dy } = arrasto;
        v.x = limitar((e.clientX - dx - r.left) / r.width * 100, 4, 96);
        v.y = limitar((e.clientY - dy - r.top) / r.height * 100, 4, 96);
        b.style.left = v.x + "%";
        b.style.top = v.y + "%";
    });
    const soltar = () => { if (arrasto) { arrasto = null; salvar(); } };
    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);
    palco.addEventListener("keydown", (e) => {
        const b = e.target.closest(".boneca-peca");
        const passo = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
        if (!b || !passo) return;
        e.preventDefault();
        const v = vestidas.find((x) => x.id === b.dataset.peca);
        v.x = limitar(v.x + passo[0], 4, 96); v.y = limitar(v.y + passo[1], 4, 96);
        b.style.left = v.x + "%"; b.style.top = v.y + "%";
        salvar();
    });

    controles.addEventListener("click", (e) => {
        const acao = e.target.closest("[data-boneca]")?.dataset.boneca;
        const v = vestidas.find((x) => x.id === selecionada);
        if (!acao || !v) return;
        if (acao === "tirar") { vestir(v.id); return; }
        v.w = limitar(v.w * (acao === "maior" ? 1.15 : 1 / 1.15), 8, 90);
        salvar();
        renderPalco();
        palco.querySelector(`[data-peca="${v.id}"]`)?.focus();
    });

    document.getElementById("bonecaLimpar").addEventListener("click", () => { vestidas = []; selecionada = null; salvar(); render(); });

    document.getElementById("bonecaSacola").addEventListener("click", () => {
        if (!vestidas.length) { avisar("Vista a boneca primeiro ✦"); return; }
        const comTamanho = vestidas.map((v) => produto(v.id)).find((p) => p.tam);
        vestidas.forEach((v) => {
            const p = produto(v.id);
            if (p.tam) return; // peça com tamanho: a cliente escolhe na janela da peça
            const ja = sacola.find((i) => i.id === p.id && i.tam === "");
            if (ja) ja.qtd = Math.min(MAX_POR_ITEM, ja.qtd + 1); else sacola.push({ id: p.id, tam: "", qtd: 1 });
        });
        renderSacola();
        balancarSacola();
        caiuNoCaldeirao(vestidas.map((v) => v.id), palco.getBoundingClientRect());
        if (comTamanho) { abrirProduto(comTamanho.id); return; }
        avisar("✦ O look da boneca caiu no caldeirão", { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
    });

    document.getElementById("bonecaStory").addEventListener("click", async (e) => {
        if (!vestidas.length) { avisar("Vista a boneca primeiro ✦"); return; }
        const botao = e.currentTarget, texto = botao.textContent;
        botao.disabled = true; botao.textContent = "Preparando a imagem…";
        try {
            await Promise.all(FONTES_STORY.map((f) => document.fonts.load(f)));
            const W = 1080, H = 1920, tela = document.createElement("canvas");
            tela.width = W; tela.height = H;
            const ctx = tela.getContext("2d");
            pintarFundoStory(ctx, W, H);
            ctx.fillStyle = "#f6eeff"; ctx.font = '700 88px "Cormorant Garamond"';
            ctx.fillText("Meu look de boneca", W / 2, 320);
            /* palco: 800 × 1200 com luz no meio */
            const pw = 750, ph = 1200, px = (W - pw) / 2, py = 400; // mesma proporção da boneca (200 × 320)
            const luz = ctx.createRadialGradient(W / 2, py + ph * .45, 0, W / 2, py + ph * .45, 620);
            luz.addColorStop(0, "rgba(205,180,255,.28)"); luz.addColorStop(1, "rgba(205,180,255,0)");
            ctx.fillStyle = luz; ctx.fillRect(px, py, pw, ph);
            const corpo = await carregarImagem("data:image/svg+xml;charset=utf-8," + encodeURIComponent(BONECA_SVG.replace("<svg ", '<svg width="750" height="1200" ')));
            ctx.drawImage(corpo, px, py, pw, ph);
            for (const v of vestidas) {
                const p = produto(v.id), lado = v.w / 100 * pw;
                const img = p.foto ? await carregarImagem(p.foto) : await imagemDaArte(ARTE[p.arte], p.tom);
                const cx = px + v.x / 100 * pw, cy = py + v.y / 100 * ph;
                if (p.foto) {
                    const l = Math.min(img.naturalWidth, img.naturalHeight);
                    ctx.save(); retanguloRedondo(ctx, cx - lado / 2, cy - lado / 2, lado, lado, 18); ctx.clip();
                    ctx.drawImage(img, (img.naturalWidth - l) / 2, (img.naturalHeight - l) / 2, l, l, cx - lado / 2, cy - lado / 2, lado, lado);
                    ctx.restore();
                } else ctx.drawImage(img, cx - lado / 2, cy - lado / 2, lado, lado);
            }
            ctx.fillStyle = "#ffb8d9"; ctx.font = '700 36px "Quicksand"';
            quebrarLinhas(ctx, vestidas.map((v) => produto(v.id).nome).join(" + "), 920).slice(0, 2).forEach((l, n) => ctx.fillText(l, W / 2, 1670 + n * 46));
            ctx.fillStyle = "#e9c46a"; ctx.font = '700 40px "Quicksand"';
            ctx.fillText("monte o seu no link da bio ✦ @eclipse_studiocg", W / 2, H - 110);
            await entregarImagem(tela, "meu-look-boneca-eclipse.png", "Meu look de boneca · Eclipse Studio");
        } catch (erro) {
            avisar("Não consegui montar a imagem agora. Tente de novo ou tire um print.");
        } finally {
            botao.disabled = false; botao.textContent = texto;
        }
    });

    render();
    /* se o catálogo mudar (planilha), a lista de peças acompanha */
    document.addEventListener("catalogo:atualizado", () => { vestidas = vestidas.filter((v) => podeVestir(produto(v.id))); render(); });
})();
