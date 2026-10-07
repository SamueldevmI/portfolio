/* Edição de gibi: o portfólio vira a revista "Samuel Mickael #1".
   - capa no topo (mês da edição atualizado aqui) e uma explosão amarela no celular da vitrine;
   - legendas "Enquanto isso…", balões falando com quem lê e retícula atrás dos títulos aparecem ao rolar;
   - no computador, cada clique em botão/link solta um "POW!" onde o mouse está;
   - rolando rápido (no dedo ou na rodinha), aparecem linhas de velocidade de quadrinho nas bordas da tela.
   Tudo só com transform/opacity, e nada se mexe pra quem prefere menos movimento.
   Arquivo separado: se algo falhar aqui, o resto do site segue igual. */
(function () {
    "use strict";
    const raiz = document.documentElement;
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const comMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const traduzir = (texto) => (window.traduzir ? window.traduzir(texto) : texto);
    const espanhol = () => raiz.lang === "es";

    /* ---------- Capa: mês da edição ---------- */
    const mes = document.getElementById("gibiMes");
    function escreverMes() {
        if (!mes) return;
        const MESES = espanhol() ? ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"] : ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const hoje = new Date();
        mes.textContent = MESES[hoje.getMonth()] + " · " + hoje.getFullYear();
    }
    escreverMes();

    /* ---------- Explosão amarela no celular da vitrine ---------- */
    const TEXTO_EXPLOSAO = "Trabalha até de madrugada!";
    const vitrine = document.querySelector(".hero-vitrine");
    let explosao = null;
    if (vitrine) {
        explosao = document.createElement("span");
        explosao.className = "gibi-explosao";
        explosao.setAttribute("aria-hidden", "true");
        explosao.textContent = traduzir(TEXTO_EXPLOSAO);
        vitrine.appendChild(explosao);
    }
    document.addEventListener("idiomaMudou", () => {
        escreverMes();
        if (explosao) explosao.textContent = traduzir(TEXTO_EXPLOSAO);
    });

    /* ---------- Foto desenhada: no toque, mostra a foto de verdade (e volta no próximo toque) ---------- */
    const avatar = document.querySelector(".avatar-hq");
    if (avatar) avatar.addEventListener("click", () => avatar.classList.toggle("real"));

    /* ---------- Contracapa: o ano do copyright ---------- */
    document.querySelectorAll(".cc-ano").forEach((el) => { el.textContent = new Date().getFullYear(); });

    if (semMovimento) return;

    /* ---------- Cupom dos anúncios: "recorta" quando a pessoa toca ---------- */
    document.addEventListener("click", (e) => {
        const cupom = e.target.closest("#servicos .link-servico");
        if (!cupom) return;
        cupom.classList.remove("recortado"); void cupom.offsetWidth; cupom.classList.add("recortado");
    });

    /* ---------- Legendas, balões, retícula e o "Fim?": aparecem quando entram na tela ----------
       A classe "gibi-anima" já foi ligada cedo, num script síncrono no <head> (antes da primeira
       pintura), pra não piscar — aqui só falta mesmo observar os elementos. */
    if ("IntersectionObserver" in window) {
        const olho = new IntersectionObserver((entradas) => entradas.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("gibi-visivel");
            olho.unobserve(e.target);
        }), { threshold: .35, rootMargin: "0px 0px -6% 0px" });
        document.querySelectorAll(".gibi-legenda, .gibi-nota, .gibi-fim, .titulo-secao, .contato > h2").forEach((el) => olho.observe(el));

        /* celular: o print do projeto "sai do quadro" quando o card chega no meio da tela */
        if (!comMouse) {
            const meio = new IntersectionObserver((entradas) => entradas.forEach((e) => e.target.classList.toggle("saindo-do-quadro", e.isIntersecting)), { rootMargin: "-38% 0px -38% 0px" });
            document.querySelectorAll(".lista-projetos .card-projeto").forEach((card) => meio.observe(card));
        }
    }

    /* ---------- O sinal no céu: acende quando o Contato aparece; a luz passeia sozinha pelas nuvens
       e, no computador, segue o mouse. O feixe sai do holofote do canto e aponta pra luz. ---------- */
    (function sinalNoCeu() {
        const secao = document.getElementById("contato");
        const sinal = secao && secao.querySelector(".sinal");
        if (!sinal || !("IntersectionObserver" in window)) return;
        const holofote = sinal.querySelector(".sinal-holofote");
        let naTela = false, quadro = 0, mouse = null, x = 0, y = 0, inicio = performance.now();
        function passo(agora) {
            quadro = 0;
            if (!naTela) return;
            const w = secao.clientWidth, faixa = parseFloat(getComputedStyle(secao).paddingTop) || 250;
            const t = (agora - inicio) / 1000;
            // alvo: o mouse (se estiver em cima da seção) ou um passeio lento de um lado pro outro
            const alvoX = mouse ? Math.min(w - 90, Math.max(90, mouse.x)) : w * (.5 + .3 * Math.sin(t * .45));
            const alvoY = mouse ? Math.min(faixa * .62, Math.max(faixa * .44, mouse.y)) : faixa * (.4 + .05 * Math.sin(t * .9));
            x += (alvoX - x) * .08; y += (alvoY - y) * .08;
            const ox = holofote.offsetLeft + holofote.offsetWidth / 2, oy = secao.clientHeight;
            const ang = Math.atan2(x - ox, oy - y) * 180 / Math.PI;
            secao.style.setProperty("--sinal-x", x.toFixed(1) + "px");
            secao.style.setProperty("--sinal-y", y.toFixed(1) + "px");
            secao.style.setProperty("--sinal-ang", ang.toFixed(2) + "deg");
            quadro = requestAnimationFrame(passo);
        }
        new IntersectionObserver((entradas) => {
            naTela = entradas.some((e) => e.isIntersecting);
            if (naTela) {
                sinal.classList.add("aceso");
                if (!x) { x = secao.clientWidth * .5; y = 110; }
                if (!quadro) quadro = requestAnimationFrame(passo);
            }
        }).observe(secao);
        if (comMouse) {
            secao.addEventListener("pointermove", (e) => { const r = secao.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
            secao.addEventListener("pointerleave", () => { mouse = null; inicio = performance.now() - Math.asin(Math.max(-1, Math.min(1, (x / secao.clientWidth - .5) / .3))) / .45 * 1000; });
        }
    })();

    /* ---------- "POW!" nos cliques: no computador, em qualquer botão ou link; no celular, só nos botões de orçamento ---------- */
    const ONOMATOPEIAS = ["POW!", "BAM!", "ZAP!", "TÁ!", "CLICK!", "BOOM!", "VUPT!"];
    let ultimoPow = 0;
    document.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        const seletor = comMouse && e.pointerType === "mouse" ? "a, button, [role='button'], summary, .card-projeto" : ".botao-principal, .nav-cta, .orcamento-fixo";
        if (!e.target.closest(seletor) || e.target.closest("input, textarea, select, .previa-site, .vitrine-palco")) return;
        const agora = performance.now();
        if (agora - ultimoPow < 160) return;
        ultimoPow = agora;
        const pow = document.createElement("span");
        pow.className = "gibi-pow";
        pow.setAttribute("aria-hidden", "true");
        pow.textContent = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)];
        pow.style.left = e.clientX + "px";
        pow.style.top = e.clientY + "px";
        pow.style.setProperty("--giro", (Math.random() * 24 - 12).toFixed(1) + "deg");
        pow.addEventListener("animationend", () => pow.remove());
        document.body.appendChild(pow);
    }, { passive: true });

    /* ---------- Linhas de velocidade quando rola rápido ----------
       A camada só existe enquanto a página está voando: some e sai do DOM logo depois que para. */
    function desenhoDasLinhas() {
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="#ffffff">';
        const n = 64;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + (Math.random() - .5) * .06;
            const largura = .006 + Math.random() * .016;
            const dentro = 68 + Math.random() * 28;
            const ponto = (r, ang) => (100 + Math.cos(ang) * r).toFixed(1) + "," + (100 + Math.sin(ang) * r).toFixed(1);
            svg += `<polygon opacity="${(.35 + Math.random() * .5).toFixed(2)}" points="${ponto(dentro, a)} ${ponto(150, a - largura)} ${ponto(150, a + largura)}"/>`;
        }
        return "data:image/svg+xml," + encodeURIComponent(svg + "</g></svg>");
    }
    let linhas = null, camada = null, ultimoY = scrollY, ultimoT = performance.now(), quadro = 0, parar = 0;
    function apagar() {
        if (!camada) return;
        const saindo = camada;
        camada = null;
        saindo.style.opacity = "0";
        setTimeout(() => saindo.remove(), 350);
    }
    function medir() {
        quadro = 0;
        const agora = performance.now(), y = scrollY;
        const velocidade = Math.abs(y - ultimoY) / Math.max(16, agora - ultimoT); // px por ms
        ultimoY = y; ultimoT = agora;
        const forca = Math.min(1, Math.max(0, (velocidade - 2.6) / 5));
        if (forca < .05) return;
        if (!camada) {
            linhas = linhas || desenhoDasLinhas();
            camada = document.createElement("div");
            camada.className = "gibi-velocidade";
            camada.setAttribute("aria-hidden", "true");
            camada.style.backgroundImage = `url("${linhas}")`;
            document.body.appendChild(camada);
            void camada.offsetWidth;
        }
        camada.style.opacity = (.25 + forca * .45).toFixed(2);
        clearTimeout(parar);
        parar = setTimeout(apagar, 140);
    }
    addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(medir); }, { passive: true });
})();
