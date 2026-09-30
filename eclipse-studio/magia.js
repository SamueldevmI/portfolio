"use strict";
/* Magias da Eclipse Studio: a lua de verdade, "apague as velas", o tarô do look e o caldeirão.
   Roda depois do script.js e usa o que ele já deixou pronto (PRODUTOS, ESTILOS, ARTE, arte(), avisar()…). */

const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

/* ========== 1. A lua de verdade: fase de hoje e contagem pra próxima lua cheia ========== */
const LUA = (() => {
    const SINODICO = 29.530588853; // dias de uma lua nova até a outra
    const DIA = 864e5;
    const LUA_NOVA_REFERENCIA = Date.UTC(2000, 0, 6, 18, 14);
    const FASES = [
        [1.85, "Lua nova"], [5.54, "Lua crescente"], [9.23, "Quarto crescente"], [12.92, "Crescente gibosa"],
        [16.61, "Lua cheia"], [20.3, "Minguante gibosa"], [23.99, "Quarto minguante"], [27.68, "Lua minguante"], [Infinity, "Lua nova"],
    ];
    const idade = (t) => ((((t - LUA_NOVA_REFERENCIA) / DIA) % SINODICO) + SINODICO) % SINODICO;
    const fase = (t) => FASES.find(([limite]) => idade(t) < limite)[1];
    const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    function proximaCheia(t) {
        let falta = SINODICO / 2 - idade(t);
        if (falta < -0.75) falta += SINODICO;
        const quando = new Date(t + falta * DIA);
        return { quando, ms: Math.max(0, falta * DIA), hoje: Math.abs(falta) <= 0.75, dias: Math.round((inicioDoDia(quando) - inicioDoDia(new Date(t))) / DIA) };
    }

    /* desenha a fase: metade iluminada + o "terminador" (a elipse que separa luz e sombra) */
    function desenho(t, crateras) {
        const a = idade(t), angulo = (a / SINODICO) * 2 * Math.PI;
        const crescendo = a < SINODICO / 2, gibosa = Math.cos(angulo) < 0;
        const rx = (Math.abs(Math.cos(angulo)) * 50).toFixed(2);
        const borda = crescendo ? 1 : 0;
        const terminador = crescendo ? (gibosa ? 1 : 0) : (gibosa ? 0 : 1);
        const id = "luz" + Math.random().toString(36).slice(2, 7);
        const buracos = crateras ? `<g clip-path="url(#${id})" class="lua-crateras"><circle cx="-14" cy="-18" r="9"/><circle cx="18" cy="8" r="12"/><circle cx="-10" cy="22" r="6"/><circle cx="26" cy="-24" r="5"/><circle cx="-28" cy="4" r="5"/></g>` : "";
        return `<svg viewBox="-56 -56 112 112" aria-hidden="true"><defs><clipPath id="${id}"><path d="M0 -50A50 50 0 0 ${borda} 0 50A${rx} 50 0 0 ${terminador} 0 -50Z"/></clipPath></defs>`
            + `<circle r="50" class="lua-sombra"/><path class="lua-luz" d="M0 -50A50 50 0 0 ${borda} 0 50A${rx} 50 0 0 ${terminador} 0 -50Z"/>${buracos}<circle r="50" class="lua-borda"/></svg>`;
    }
    return { fase, proximaCheia, desenho };
})();

(function luaNaTela() {
    const pilula = document.getElementById("luaHoje");
    const grande = document.getElementById("ritualLua");
    const quandoEl = document.getElementById("ritualQuando");
    const contagem = document.getElementById("contagemLua");
    const dataLonga = (d) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

    function atualizar() {
        const agora = Date.now();
        const cheia = LUA.proximaCheia(agora);
        const quando = cheia.hoje ? "hoje é lua cheia!" : cheia.dias === 1 ? "drop na lua cheia amanhã" : `drop na lua cheia em ${cheia.dias} dias`;
        if (pilula) pilula.innerHTML = `${LUA.desenho(agora)}<span><b>${LUA.fase(agora)}</b> · ${quando}</span>`;
        if (grande) grande.innerHTML = LUA.desenho(agora, true);
        if (quandoEl) quandoEl.textContent = cheia.hoje
            ? "Hoje é noite de lua cheia 🌕 Fica de olho no @eclipse_studiocg pra ver o que chegou."
            : `Hoje: ${LUA.fase(agora).toLowerCase()}. A próxima lua cheia é em ${dataLonga(cheia.quando)}: fica de olho no @eclipse_studiocg pra ver o que chega.`;
        if (contagem) {
            const min = Math.floor(cheia.ms / 6e4);
            const partes = [[Math.floor(min / 1440), "dias"], [Math.floor(min / 60) % 24, "horas"], [min % 60, "minutos"]];
            contagem.innerHTML = cheia.hoje ? "" : partes.map(([n, r]) => `<div><b>${n}</b><span>${n === 1 ? r.slice(0, -1) : r}</span></div>`).join("");
            contagem.setAttribute("aria-label", cheia.hoje ? "" : `Faltam ${partes.map(([n, r]) => `${n} ${r}`).join(", ")} pra lua cheia`);
        }
    }
    atualizar();
    setInterval(() => { if (!document.hidden) atualizar(); }, 30000);
})();

/* ========== 2. Apague as velas: o site fica no escuro e a luz da vela revela segredos ========== */
(function apagueAsVelas() {
    const botao = document.getElementById("apagarVelas");
    const acender = document.getElementById("acenderVelas");
    const luz = document.getElementById("luzVela");
    const gato = document.getElementById("gatoEscondido");
    const dialogo = document.getElementById("dialogoGato");
    if (!botao || !luz) return;
    const raiz = document.documentElement;

    document.querySelectorAll(".hero .vela").forEach((vela) => {
        vela.insertAdjacentHTML("beforeend", '<path class="fumaca" d="M20 30c-5-6 5-10 0-16s5-9 0-14"/>');
    });

    let pos = { x: innerWidth / 2, y: innerHeight / 3 };
    let pendente = false;
    function posicionar() {
        pendente = false;
        const lado = Math.max(innerWidth, innerHeight) * 2.1; // cobre a tela de qualquer ponto, sem gastar memória à toa
        luz.style.width = luz.style.height = lado + "px";
        luz.style.transform = `translate(${pos.x - lado / 2}px, ${pos.y - lado / 2}px)`; // só transform: não repinta a tela
    }
    function seguir(x, y) {
        if (!raiz.classList.contains("escuro")) return;
        pos = { x, y };
        if (!pendente) { pendente = true; requestAnimationFrame(posicionar); }
    }
    addEventListener("pointermove", (e) => seguir(e.clientX, e.clientY), { passive: true });
    addEventListener("pointerdown", (e) => seguir(e.clientX, e.clientY), { passive: true });
    addEventListener("touchmove", (e) => seguir(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    addEventListener("resize", () => { if (raiz.classList.contains("escuro")) posicionar(); });

    function apagar() {
        raiz.classList.add("velas-apagadas");
        posicionar();
        setTimeout(() => {
            raiz.classList.add("escuro");
            acender.hidden = false;
            acender.focus({ preventScroll: true });
            avisar("🕯 Mova o dedo (ou o mouse): a luz da vela revela segredos.");
        }, semMovimento ? 0 : 650);
    }
    function reacender() {
        raiz.classList.remove("escuro", "velas-apagadas");
        acender.hidden = true;
    }
    botao.addEventListener("click", apagar);
    acender.addEventListener("click", () => { reacender(); botao.focus({ preventScroll: true }); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && raiz.classList.contains("escuro") && !document.querySelector("dialog[open]")) reacender(); });

    /* o gato preto: só aparece no escuro */
    const { codigo, premio } = LOJA.segredo;
    gato.addEventListener("click", () => {
        const jaAchou = ler(CHAVE_GATO, false);
        document.getElementById("gatoTexto").textContent = jaAchou
            ? "Você já tinha achado! O código continua guardado no seu pedido."
            : `Quem acha o gato ganha um código: ${premio}.`;
        document.getElementById("gatoCodigo").textContent = codigo;
        document.getElementById("gatoUsar").textContent = jaAchou ? "Beleza" : "Pôr o código no meu pedido";
        dialogo.showModal();
    });
    document.getElementById("gatoUsar").addEventListener("click", () => {
        if (!ler(CHAVE_GATO, false)) {
            guardar(CHAVE_GATO, true);
            atualizarLinkPedido();
            avisar(`🐈‍⬛ Código ${codigo} guardado: ele vai junto no seu pedido.`);
        }
        dialogo.close();
        reacender();
    });
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
})();

/* ========== 3. Tarô do look: essência (a vibe), a peça (roupa) e o feitiço (acessório) ========== */
Object.assign(ARTE, {
    arcRosa: `<path class="n g" d="M50 58Q47 76 50 92"/><ellipse class="m" cx="40" cy="74" rx="9" ry="4" transform="rotate(-30 40 74)"/><ellipse class="m" cx="60" cy="82" rx="9" ry="4" transform="rotate(30 60 82)"/>`
        + rosa(50, 40, 20) + brilho(80, 22, .6, "o s") + brilho(20, 30, .45),
    arcMorcego: `<circle class="c" cx="60" cy="36" r="18"/>` + morcego(48, 60, 1.35) + brilho(20, 26, .5, "o s") + brilho(84, 76, .45),
    arcLua: `<path class="c" d="M60 14A36 36 0 1 0 60 86A42 42 0 0 1 60 14Z"/>` + brilho(70, 34, .7, "o s") + brilho(80, 62, .45, "o s") + brilho(64, 80, .35),
    arcCoracao: `<path class="r" transform="translate(50 56) scale(3)" d="${CORACAO}"/><path class="p" d="M47.5 12h5v7h7v5h-7v11h-5v-11h-7v-5h7z"/>` + brilho(22, 70, .55, "o s") + brilho(80, 30, .5),
});

const ARCANOS = {
    vitoriana: { numero: "XIV", nome: "A Rosa", arte: "arcRosa", tom: "c", leitura: "Delicadeza assombrada, feito retrato antigo: você guarda segredos em renda e escreve cartas que ninguém lê." },
    tradgoth: { numero: "XIII", nome: "O Morcego", arte: "arcMorcego", tom: "r", leitura: "Você é de veludo e de rua. A noite inteira é sua, e a lua já sabe o seu nome." },
    bruxinha: { numero: "XVIII", nome: "A Lua", arte: "arcLua", tom: "l", leitura: "Intuição afiada, bola de cristal na bolsa e um gato como conselheiro. Você já sabia que ia tirar essa carta." },
    pastel: { numero: "VI", nome: "O Coração", arte: "arcCoracao", tom: "m", leitura: "Doce por fora, macabra por dentro: você equilibra laço e caveira sem pedir licença." },
};
const NOMES_NO_TARO = {
    camiseta: "A Camiseta", perfume: "O Perfume", espartilho: "O Espartilho", saia: "A Saia", vestido: "O Vestido", blusa: "A Blusa",
    capa: "A Capa", casaco: "O Casaco", choker: "O Choker", chokerRosa: "A Rosa Vermelha", rosario: "O Rosário", camafeu: "O Camafeu",
    colarCruz: "A Cruz", brincoMorcego: "Os Morcegos", brincoCruz: "As Cruzes", anel: "O Olho", colarBola: "A Bola de Cristal", bolsaCaixao: "O Caixão",
};
const nomeNoTaro = (p) => NOMES_NO_TARO[p.id] || p.nome;

(function taroDoLook() {
    const mesa = document.getElementById("taroCartas");
    const leitura = document.getElementById("taroLeitura");
    const botao = document.getElementById("taroTirar");
    if (!mesa) return;
    const PAPEIS = ["Essência", "A peça", "O feitiço"];
    let tiragem = null;

    const verso = `<div class="carta-verso"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" class="coroa"/><circle cx="18" cy="14.5" r="10" class="disco"/></svg></div>`;
    const frente = ({ numero, titulo, sub, tom, desenho }) => `<div class="carta-frente">
        <span class="carta-num">${numero}</span>
        <span class="carta-arte tom-${tom}">${desenho}</span>
        <span class="carta-nome">${esc(titulo)}</span>
        ${sub ? `<span class="carta-sub">${esc(sub)}</span>` : ""}
    </div>`;

    function mostrarVersos() {
        mesa.innerHTML = PAPEIS.map((papel) => `<li class="taro-carta"><span class="carta-papel">${papel}</span><div class="carta"><div class="carta-dentro">${verso}</div></div></li>`).join("");
    }

    function tirar() {
        let nova;
        do {
            const estilo = sortear(ESTILOS);
            const doEstilo = PRODUTOS.filter((p) => p.estilos.includes(estilo.id));
            nova = { estilo, arcano: ARCANOS[estilo.id], peca: sortear(doEstilo.filter((p) => p.cat === "Roupas")), feitico: sortear(doEstilo.filter((p) => p.cat !== "Roupas")) };
        } while (tiragem && nova.peca === tiragem.peca && nova.feitico === tiragem.feitico);
        return nova;
    }

    function revelar() {
        botao.disabled = true;
        leitura.hidden = true;
        mesa.querySelectorAll(".taro-carta").forEach((c) => c.classList.remove("virada"));
        mesa.classList.add("embaralhando");
        tiragem = tirar();
        const { estilo, arcano, peca, feitico } = tiragem;
        const cartas = [
            { numero: arcano.numero, titulo: arcano.nome, sub: estilo.nome, tom: arcano.tom, desenho: `<svg class="arte" viewBox="0 0 100 100" aria-hidden="true">${ARTE[arcano.arte]}</svg>` },
            { numero: "✦", titulo: nomeNoTaro(peca), sub: precoTexto(peca), tom: peca.tom, desenho: arte(peca) },
            { numero: "✦", titulo: nomeNoTaro(feitico), sub: precoTexto(feitico), tom: feitico.tom, desenho: arte(feitico) },
        ];
        const espera = semMovimento ? 0 : 650;
        setTimeout(() => {
            mesa.classList.remove("embaralhando");
            mesa.innerHTML = cartas.map((c, i) => `<li class="taro-carta" aria-label="${PAPEIS[i]}: ${esc(c.titulo)}"><span class="carta-papel">${PAPEIS[i]}</span><div class="carta"><div class="carta-dentro">${verso}${frente(c)}</div></div></li>`).join("");
            const itens = [...mesa.children];
            itens.forEach((li, i) => setTimeout(() => li.classList.add("virada"), semMovimento ? 0 : 300 + i * 450));
            setTimeout(() => {
                leitura.innerHTML = `<h3>${esc(arcano.nome)} <span>· ${esc(estilo.nome)}</span></h3>
                    <p class="leitura-texto">${esc(arcano.leitura)}</p>
                    <p class="leitura-look">As cartas escolheram: <b>${esc(peca.nome)}</b> (${precoTexto(peca)}) pra vestir, e <b>${esc(feitico.nome)}</b> (${precoTexto(feitico)}) pra fechar o feitiço.</p>
                    <div class="leitura-acoes">
                        <button class="botao" type="button" data-taro-sacola>Pôr as duas no caldeirão</button>
                        <button class="botao botao-linha" type="button" data-taro-story>Salvar pro story</button>
                        <button class="botao botao-linha" type="button" data-estilo="${estilo.id}">Ver tudo da vibe ${esc(estilo.nome)}</button>
                    </div>`;
                leitura.hidden = false;
                botao.disabled = false;
                botao.textContent = "Tirar de novo";
            }, semMovimento ? 0 : 300 + 3 * 450 + 200);
        }, espera);
    }

    function porNaSacola() {
        const pecas = [tiragem.peca, tiragem.feitico];
        const comTamanho = pecas.find((p) => p.tam);
        if (comTamanho) { abrirProduto(comTamanho.id); return; } // peça com tamanho: a cliente escolhe no detalhe
        pecas.forEach((p) => {
            const existente = sacola.find((i) => i.id === p.id && i.tam === "");
            if (existente) existente.qtd = Math.min(MAX_POR_ITEM, existente.qtd + 1); else sacola.push({ id: p.id, tam: "", qtd: 1 });
        });
        caiuNoCaldeirao(pecas.map((p) => p.id), mesa.getBoundingClientRect());
        renderSacola();
        balancarSacola();
        avisar("✦ O look do tarô caiu no caldeirão", { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
    }

    botao.addEventListener("click", revelar);
    leitura.addEventListener("click", (e) => {
        if (e.target.closest("[data-taro-sacola]")) porNaSacola();
        if (e.target.closest("[data-taro-story]")) salvarStory(tiragem, e.target.closest("button"));
    });
    mostrarVersos();
})();

/* imagem 1080 × 1920 da tiragem, desenhada num canvas com as mesmas fontes e ilustrações da loja */
const CORES_TOM = { l: ["#efe4ff", "#cbb3f5"], r: ["#ffeaf4", "#f5b7d5"], m: ["#e6fbf2", "#a9e3cf"], c: ["#fbf6ec", "#e3d4b8"] };
function imagemDaArte(desenho, tom) {
    const estilos = `*{stroke:#241a33;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}.l{fill:#cdb4ff}.r{fill:#ffb8d9}.m{fill:#aef0d6}.c{fill:#fff4fb}.p{fill:#241a33}.n{fill:none}.o{fill:#e9c46a}.v{fill:#a3203f}.pe{fill:#4d3f60}.vaz{fill:${CORES_TOM[tom][0]}}.g{stroke-width:5}.f{stroke-width:1.4}.s{stroke:none}.fl{stroke:#cdb4ff}.fr{stroke:#ffb8d9}.fo{stroke:#e9c46a}.g+.fl{stroke-width:2.4}.g+.fo{stroke-width:2.2}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><style>${estilos}</style>${desenho}</svg>`;
    return carregarImagem("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
}
function carregarImagem(src) {
    return new Promise((ok, erro) => { const img = new Image(); img.onload = () => ok(img); img.onerror = erro; img.src = src; });
}
function quebrarLinhas(ctx, texto, largura) {
    const linhas = [];
    let linha = "";
    texto.split(" ").forEach((palavra) => {
        const teste = linha ? linha + " " + palavra : palavra;
        if (ctx.measureText(teste).width > largura && linha) { linhas.push(linha); linha = palavra; } else linha = teste;
    });
    if (linha) linhas.push(linha);
    return linhas;
}
function retanguloRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

async function salvarStory(t, botao) {
    if (!t) return;
    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Preparando a imagem…";
    try {
        await Promise.all(['400 60px "UnifrakturMaguntia"', 'italic 700 60px "Cormorant Garamond"', '700 60px "Cormorant Garamond"', '700 30px "Quicksand"', '500 30px "Quicksand"'].map((f) => document.fonts.load(f)));
        const W = 1080, H = 1920;
        const tela = document.createElement("canvas");
        tela.width = W; tela.height = H;
        const ctx = tela.getContext("2d");

        const fundo = ctx.createLinearGradient(0, 0, 0, H);
        fundo.addColorStop(0, "#150c1f"); fundo.addColorStop(.6, "#1f0f26"); fundo.addColorStop(1, "#36131c");
        ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H);
        const brilhoRoxo = ctx.createRadialGradient(160, 120, 0, 160, 120, 800);
        brilhoRoxo.addColorStop(0, "rgba(160,110,230,.35)"); brilhoRoxo.addColorStop(1, "rgba(160,110,230,0)");
        ctx.fillStyle = brilhoRoxo; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 90; i++) { // poeira dourada
            ctx.fillStyle = `rgba(233,196,106,${(.2 + Math.random() * .5).toFixed(2)})`;
            ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.2 + .6, 0, 7); ctx.fill();
        }
        ctx.textAlign = "center";

        /* marca */
        ctx.fillStyle = "#e9c46a"; ctx.beginPath(); ctx.arc(W / 2 - 250, 150, 30, 0, 7); ctx.fill();
        ctx.fillStyle = "#150c1f"; ctx.beginPath(); ctx.arc(W / 2 - 245, 145, 28, 0, 7); ctx.fill();
        ctx.fillStyle = "#f6eeff"; ctx.font = '400 68px "UnifrakturMaguntia"'; ctx.fillText("Eclipse Studio", W / 2 + 30, 172);

        ctx.font = '700 92px "Cormorant Garamond"'; ctx.fillText("Meu tarô do look", W / 2, 330);
        const degrade = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
        degrade.addColorStop(0, "#cdb4ff"); degrade.addColorStop(.55, "#ffb8d9"); degrade.addColorStop(1, "#aef0d6");
        ctx.fillStyle = degrade; ctx.font = 'italic 700 76px "Cormorant Garamond"';
        ctx.fillText(`${t.arcano.nome} · ${t.estilo.nome}`, W / 2, 425);

        /* as três cartas */
        const cartas = [
            { papel: "essência", numero: t.arcano.numero, nome: t.arcano.nome, tom: t.arcano.tom, img: await imagemDaArte(ARTE[t.arcano.arte], t.arcano.tom) },
            { papel: "a peça", numero: "✦", nome: nomeNoTaro(t.peca), tom: t.peca.tom, img: t.peca.foto ? await carregarImagem(t.peca.foto) : await imagemDaArte(ARTE[t.peca.arte], t.peca.tom) },
            { papel: "o feitiço", numero: "✦", nome: nomeNoTaro(t.feitico), tom: t.feitico.tom, img: t.feitico.foto ? await carregarImagem(t.feitico.foto) : await imagemDaArte(ARTE[t.feitico.arte], t.feitico.tom) },
        ];
        const cw = 300, ch = 520, y0 = 520;
        cartas.forEach((c, i) => {
            const x = 60 + i * (cw + 30);
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
            retanguloRedondo(ctx, x, y0, cw, ch, 22); ctx.fillStyle = "#241a33"; ctx.fill();
            ctx.restore();
            retanguloRedondo(ctx, x + 10, y0 + 10, cw - 20, ch - 20, 16);
            const tom = ctx.createLinearGradient(0, y0, 0, y0 + ch);
            tom.addColorStop(0, CORES_TOM[c.tom][0]); tom.addColorStop(1, CORES_TOM[c.tom][1]);
            ctx.fillStyle = tom; ctx.fill();
            ctx.lineWidth = 4; ctx.strokeStyle = "#e9c46a"; ctx.stroke();
            ctx.fillStyle = "#8a5a2b"; ctx.font = '700 34px "Cormorant Garamond"'; ctx.fillText(c.numero, x + cw / 2, y0 + 64);
            if (c.img.naturalWidth && c.img.naturalWidth !== c.img.naturalHeight) { // foto de verdade: recorta quadrado
                const lado = Math.min(c.img.naturalWidth, c.img.naturalHeight);
                ctx.drawImage(c.img, (c.img.naturalWidth - lado) / 2, (c.img.naturalHeight - lado) / 2, lado, lado, x + 30, y0 + 90, cw - 60, cw - 60);
            } else ctx.drawImage(c.img, x + 30, y0 + 90, cw - 60, cw - 60);
            ctx.fillStyle = "#241a33"; ctx.font = '700 38px "Cormorant Garamond"';
            quebrarLinhas(ctx, c.nome, cw - 40).slice(0, 2).forEach((l, n) => ctx.fillText(l, x + cw / 2, y0 + 400 + n * 42));
            ctx.fillStyle = "#e9c46a"; ctx.font = '700 30px "Quicksand"'; ctx.fillText(c.papel, x + cw / 2, y0 + ch + 56);
        });

        /* a leitura */
        ctx.fillStyle = "#f6eeff"; ctx.font = 'italic 700 50px "Cormorant Garamond"';
        const linhas = quebrarLinhas(ctx, `“${t.arcano.leitura}”`, 900);
        linhas.forEach((l, n) => ctx.fillText(l, W / 2, 1230 + n * 64));
        const yLook = 1230 + linhas.length * 64 + 60;
        ctx.fillStyle = "#ffb8d9"; ctx.font = '700 38px "Quicksand"';
        quebrarLinhas(ctx, `${t.peca.nome} + ${t.feitico.nome}`, 920).forEach((l, n) => ctx.fillText(l, W / 2, yLook + n * 50));

        ctx.fillStyle = "#cfc0e6"; ctx.font = 'italic 600 42px "Cormorant Garamond"';
        ctx.fillText(`✦ tirado numa noite de ${LUA.fase(Date.now()).toLowerCase()} ✦`, W / 2, H - 260);
        ctx.fillStyle = "#e9c46a"; ctx.font = '700 40px "Quicksand"';
        ctx.fillText("tire o seu no link da bio ✦ @eclipse_studiocg", W / 2, H - 120);

        const blob = await new Promise((ok) => tela.toBlob(ok, "image/png"));
        const arquivo = new File([blob], "meu-taro-eclipse-studio.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try { await navigator.share({ files: [arquivo], title: "Meu tarô do look · Eclipse Studio" }); } catch (erro) { /* a cliente desistiu de compartilhar */ }
        } else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = arquivo.name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(link.href), 4000);
            avisar("✦ Imagem salva. É só postar no story e marcar @eclipse_studiocg");
        }
    } catch (erro) {
        avisar("Não consegui montar a imagem agora. Tente de novo ou tire um print da tiragem.");
    } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

/* ========== 4. O caldeirão: a peça voa até a sacola e o caldeirão borbulha ========== */
(function caldeirao() {
    function borbulhar() {
        botaoSacola.classList.remove("borbulha");
        void botaoSacola.offsetWidth;
        botaoSacola.classList.add("borbulha");
        setTimeout(() => botaoSacola.classList.remove("borbulha"), 1300);
    }
    document.addEventListener("sacola:caiu", (e) => {
        const { ids, origem } = e.detail;
        if (semMovimento || !origem || !origem.width) { borbulhar(); return; }
        const alvo = botaoSacola.getBoundingClientRect();
        const ax = alvo.left + alvo.width / 2, ay = alvo.top + alvo.height / 2;
        ids.forEach((id, i) => {
            const p = produto(id);
            const voando = document.createElement("div");
            voando.className = `voando tom-${p.tom}`;
            voando.innerHTML = arte(p);
            const tam = 76;
            const ox = origem.left + origem.width * (ids.length > 1 ? (i + .5) / ids.length : .5), oy = origem.top + origem.height / 2;
            voando.style.left = ox - tam / 2 + "px";
            voando.style.top = oy - tam / 2 + "px";
            document.body.appendChild(voando);
            const dx = ax - ox, dy = ay - oy;
            voando.animate([
                { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
                { transform: `translate(${dx * .45}px, ${dy * .45 - 140}px) scale(.8) rotate(-18deg)`, opacity: 1, offset: .45 },
                { transform: `translate(${dx}px, ${dy}px) scale(.18) rotate(24deg)`, opacity: .4 },
            ], { duration: 780, delay: i * 110, easing: "cubic-bezier(.45, 0, .7, .4)", fill: "both" }).onfinish = () => {
                voando.remove();
                if (i === ids.length - 1) borbulhar();
            };
        });
    });
})();
