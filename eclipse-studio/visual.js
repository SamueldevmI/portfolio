"use strict";
/* Visual da Eclipse Studio: abertura com eclipse, céu que segue a hora, lua de sangue, rosas e espinhos
   nas bordas, cartas holográficas, títulos com folha de ouro e névoa entre as seções.
   Prévia: ?ceu=dia | crepusculo | noite | bruxas   e   ?lua=sangue   (pra ver sem esperar a hora certa) */

const PREVIA = new URLSearchParams(location.search);
const RAIZ = document.documentElement;
const telaLarga = matchMedia("(min-width: 1280px)");
const mouseFino = matchMedia("(pointer: fine)").matches;

/* ========== 1. Abertura: a lua cobre o sol e o site acende (primeira visita do dia) ========== */
(function abertura() {
    const temCartaOuPeca = PREVIA.has("presente") || location.hash.startsWith("#peca-");
    if (semMovimento || temCartaOuPeca || (ler("es-abertura", "") === hojeChave() && !PREVIA.has("abertura"))) return;
    guardar("es-abertura", hojeChave());
    const raios = Array.from({ length: 24 }, (_, i) => `<line x1="200" y1="${i % 2 ? 70 : 52}" x2="200" y2="96" transform="rotate(${i * 15} 200 200)"/>`).join("");
    const el = document.createElement("div");
    el.className = "abertura";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<svg viewBox="0 0 400 400">
        <defs><radialGradient id="coroaAb"><stop offset=".55" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset=".7" stop-color="#e9c46a" stop-opacity=".45"/><stop offset="1" stop-color="#e9c46a" stop-opacity="0"/></radialGradient></defs>
        <g class="ab-coroa"><circle cx="200" cy="200" r="150" fill="url(#coroaAb)"/><g class="ab-raios">${raios}</g></g>
        <circle class="ab-sol" cx="200" cy="200" r="78"/>
        <circle class="ab-lua" cx="200" cy="200" r="80"/>
        <circle class="ab-diamante" cx="262" cy="150" r="7"/>
    </svg><p class="ab-nome">Eclipse Studio</p><p class="ab-pular">toque pra entrar</p>`;
    document.body.appendChild(el);
    RAIZ.classList.add("abrindo");
    let foi = false;
    const sair = () => {
        if (foi) return;
        foi = true;
        el.classList.add("saindo");
        RAIZ.classList.remove("abrindo");
        setTimeout(() => el.remove(), 700);
    };
    el.addEventListener("click", sair);
    addEventListener("keydown", sair, { once: true });
    setTimeout(sair, 2300);
})();

/* ========== 2. Céu que segue a hora de verdade + 7. lua de sangue na lua cheia ========== */
(function ceu() {
    const camada = document.createElement("div");
    camada.className = "ceu";
    camada.setAttribute("aria-hidden", "true");
    /* o campo de estrelas é uma imagem parada (CSS); só estas poucas piscam */
    const estrelas = Array.from({ length: 10 }, () =>
        `<i style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;--d:${(Math.random() * 4).toFixed(1)}s"></i>`).join("");
    camada.innerHTML = `<div class="ceu-nuvens"><b></b><b></b><b></b></div><div class="ceu-estrelas">${estrelas}</div><div class="ceu-lua-sangue"></div>`;
    document.body.insertBefore(camada, document.body.firstChild);

    const NOMES = { dia: "céu de dia", crepusculo: "céu de crepúsculo", noite: "céu de noite", bruxas: "hora das bruxas" };
    function momento(h) {
        if (h === 3) return "bruxas";
        if (h >= 7 && h < 17) return "dia";
        if ((h >= 17 && h < 19) || (h >= 5 && h < 7)) return "crepusculo";
        return "noite";
    }
    function atualizar() {
        const pedido = PREVIA.get("ceu");
        const agora = NOMES[pedido] ? pedido : momento(new Date().getHours());
        RAIZ.dataset.ceu = agora;
        const sangue = PREVIA.get("lua") === "sangue" || LUA.proximaCheia(Date.now()).hoje;
        if (sangue !== RAIZ.classList.contains("lua-de-sangue")) {
            RAIZ.classList.toggle("lua-de-sangue", sangue);
            document.querySelector(".aviso-lua")?.remove();
            if (sangue) document.body.insertAdjacentHTML("afterbegin", '<p class="aviso-lua">🌕 Lua de sangue: noite de drop na Eclipse ✦</p>');
        }
    }
    atualizar();
    setInterval(atualizar, 5 * 60 * 1000);
})();

/* ========== 3. Rosas e espinhos crescendo pelas bordas conforme a página desce ========== */
const ROSA_SVG = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10" class="rs-flor"/><path class="rs-miolo" d="M-3 0a3 3 0 1 1 3 3a6.5 6.5 0 1 1 -6.5 -6.5M-6.6 .5a6.6 6 0 0 0 13.2 0"/></svg>`;
(function ramos() {
    /* uma linha ondulada de ponta a ponta, com espinhos, folhas e rosas que aparecem pelo caminho */
    function ramo(lado) {
        let d = "M30 0", espinhos = "", folhas = "";
        for (let y = 0, i = 0; y < 1000; y += 50, i++) {
            const x = i % 2 ? 46 : 14;
            d += ` S${x} ${y + 25} 30 ${y + 50}`;
            const ty = y + 12 + (i % 3) * 6, tx = i % 2 ? 37 : 23, dir = i % 2 ? 1 : -1;
            espinhos += `<path class="rm-espinho" data-em="${(ty / 1000).toFixed(3)}" d="M${tx} ${ty}l${dir * 7} -3l${-dir * 5} 6z"/>`;
            if (i % 3 === 1) folhas += `<ellipse class="rm-folha" data-em="${((y + 30) / 1000).toFixed(3)}" cx="${30 + dir * -11}" cy="${y + 30}" rx="9" ry="4" transform="rotate(${dir * 30} ${30 + dir * -11} ${y + 30})"/>`;
        }
        const rosas = [.16, .38, .6, .82, .98].map((em, i) => `<span class="rm-rosa" data-em="${em}" style="top:${em * 100}%;${i % 2 ? "left:-2px" : "right:-2px"}">${ROSA_SVG}</span>`).join("");
        const el = document.createElement("div");
        el.className = `ramo ramo-${lado}`;
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = `<svg viewBox="0 0 60 1000" preserveAspectRatio="none"><path class="rm-caule" pathLength="1" d="${d}"/>${folhas}${espinhos}</svg>${rosas}`;
        document.body.appendChild(el);
        el._pecas = [...el.querySelectorAll("[data-em]")].map((x) => ({ el: x, em: +x.dataset.em, viva: false }));
        return el;
    }
    let ramos = [];
    let ultimo = -1, pendente = false;
    function crescer() {
        pendente = false;
        const total = document.documentElement.scrollHeight - innerHeight;
        const p = Math.round(Math.min(1, Math.max(0, total > 0 ? scrollY / total : 0)) * 200) / 200;
        if (p === ultimo) return;
        ultimo = p;
        ramos.forEach((r) => {
            r.style.setProperty("--cresceu", p);
            r._pecas.forEach((x) => {
                const viva = p > 0 && x.em <= p;
                if (viva !== x.viva) { x.viva = viva; x.el.classList.toggle("viva", viva); }
            });
        });
    }
    function montar() {
        ramos.forEach((r) => r.remove());
        ramos = telaLarga.matches && !semMovimento ? [ramo("e"), ramo("d")] : [];
        ultimo = -1;
        crescer();
    }
    addEventListener("scroll", () => { if (ramos.length && !pendente) { pendente = true; requestAnimationFrame(crescer); } }, { passive: true });
    telaLarga.addEventListener("change", montar);
    montar();

    /* em qualquer tela: uma rosa desabrocha no fim de cada seção */
    const secoes = document.querySelectorAll("body > section:not(.hero):not(.vantagens), body > main");
    const ver = new IntersectionObserver((itens) => itens.forEach((it) => { if (it.isIntersecting) { it.target.classList.add("aberta"); ver.unobserve(it.target); } }), { threshold: .6 });
    secoes.forEach((s) => {
        if (s.nextElementSibling?.classList.contains("cera")) return; // já tem a cera de vela como divisória
        const div = document.createElement("div");
        div.className = "rosa-divisor";
        div.setAttribute("aria-hidden", "true");
        div.innerHTML = `<svg viewBox="0 0 240 30" class="rd-caule"><path pathLength="1" d="M0 15C30 6 60 24 96 15M240 15C210 6 180 24 144 15"/><path class="rd-espinho" d="M30 11l3 -7l2 6M60 19l3 7l2 -6M180 11l3 -7l2 6M210 19l3 7l2 -6"/></svg><span class="rd-rosa">${ROSA_SVG}</span>`;
        s.appendChild(div);
        if (semMovimento) div.classList.add("aberta"); else ver.observe(div);
    });
})();

/* ========== 4. Cartas holográficas: inclinam seguindo o mouse (ou o giro do celular) ========== */
(function holografia() {
    if (semMovimento) return;
    if (mouseFino) {
        let carta = null, pos = null, pendente = false;
        const aplicar = () => {
            pendente = false;
            if (!carta || !pos) return;
            const r = carta.getBoundingClientRect();
            const x = (pos.x - r.left) / r.width, y = (pos.y - r.top) / r.height;
            carta.style.setProperty("--rx", `${((.5 - y) * 14).toFixed(2)}deg`);
            carta.style.setProperty("--ry", `${((x - .5) * 16).toFixed(2)}deg`);
            carta.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
            carta.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        };
        document.addEventListener("pointermove", (e) => {
            const c = e.target.closest?.(".card");
            if (c !== carta) {
                if (carta) carta.classList.remove("holo");
                carta = c;
                if (carta) carta.classList.add("holo");
            }
            pos = { x: e.clientX, y: e.clientY };
            if (carta && !pendente) { pendente = true; requestAnimationFrame(aplicar); }
        }, { passive: true });
        return;
    }
    /* celular: o brilho das cartas acompanha o giro do aparelho (sem pedir permissão; no iPhone fica parado) */
    let pendente = false, valores = null;
    addEventListener("deviceorientation", (e) => {
        if (e.gamma == null) return;
        valores = { g: Math.max(-30, Math.min(30, e.gamma)), b: Math.max(-30, Math.min(30, (e.beta || 45) - 45)) };
        if (!pendente) {
            pendente = true;
            requestAnimationFrame(() => {
                pendente = false;
                RAIZ.style.setProperty("--gx", `${(50 + valores.g * 1.6).toFixed(1)}%`);
                RAIZ.style.setProperty("--gy", `${(50 + valores.b * 1.6).toFixed(1)}%`);
                RAIZ.classList.add("giroscopio");
            });
        }
    }, { passive: true });
})();

/* ========== 5. Títulos com folha de ouro (brilham quando chegam na tela) + 6. névoa entre as seções ========== */
(function ouroENevoa() {
    if (semMovimento) return;
    const titulos = document.querySelectorAll(".titulo");
    const brilhar = new IntersectionObserver((itens) => itens.forEach((it) => {
        if (!it.isIntersecting) return;
        it.target.classList.remove("ouro-passa");
        void it.target.offsetWidth;
        it.target.classList.add("ouro-passa");
    }), { threshold: 1 });
    titulos.forEach((t) => {
        brilhar.observe(t);
        t.addEventListener("animationend", (e) => { if (e.animationName === "ouro-passa") t.classList.remove("ouro-passa"); });
    });

    /* névoa: só existe enquanto se desfaz. Nasce quando a seção entra na tela e some em 2 segundos */
    const secoes = [...document.querySelectorAll("body > section:not(.hero):not(.vantagens), body > main")]
        .filter((s) => s.getBoundingClientRect().top > innerHeight);
    const dissipar = new IntersectionObserver((itens) => itens.forEach((it) => {
        if (!it.isIntersecting) return;
        dissipar.unobserve(it.target);
        const nevoa = document.createElement("div");
        nevoa.className = "nevoa";
        nevoa.setAttribute("aria-hidden", "true");
        it.target.prepend(nevoa);
        requestAnimationFrame(() => requestAnimationFrame(() => nevoa.classList.add("some")));
        setTimeout(() => nevoa.remove(), 1600);
    }), { rootMargin: "0px 0px -10% 0px" });
    secoes.forEach((s) => { s.classList.add("na-nevoa"); dissipar.observe(s); });
})();
