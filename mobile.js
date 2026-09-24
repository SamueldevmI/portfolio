/* Recursos só do celular (tela de toque): sensores, gestos, vibração, WhatsApp de acordo com a seção e
   botão de instalar o portfólio. Os sons vêm do musica.js (window.musicaSite) e só tocam com o áudio
   liberado. Nada aqui roda no computador com mouse. */
(function () {
    "use strict";
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const som = (nome) => { if (window.musicaSite && window.musicaSite[nome]) window.musicaSite[nome](); };
    const vibrar = (padrao) => { if (navigator.vibrate) navigator.vibrate(padrao); };
    const toast = (texto) => { if (typeof window.mostrarToast === "function") window.mostrarToast(texto); };
    const INTERATIVO = "a[href], button, summary, label, input, textarea, select, .chip-filtro, .orc-opcao, [role='button']";
    const SECOES = ["inicio", "sobre-mim", "projetos", "mais-projetos", "servicos", "orcamento", "jornada", "contato"];
    const WHATS = "5567996034205";

    /* iPhone só libera sensores de movimento depois de um toque e de a pessoa permitir */
    let pediuSensor = false;
    function pedirSensores() {
        if (pediuSensor) return;
        pediuSensor = true;
        [window.DeviceOrientationEvent, window.DeviceMotionEvent].forEach((Evento) => {
            if (Evento && typeof Evento.requestPermission === "function") Evento.requestPermission().catch(() => {});
        });
    }
    document.addEventListener("touchend", pedirSensores, { once: true, passive: true });

    /* 1) Inclinar o celular mexe o topo (foto, pixels e título em camadas, tipo papel de parede 3D) */
    const hero = document.querySelector(".hero-conteudo");
    if (hero && !semMovimento) {
        let base = null, quadro = 0;
        window.addEventListener("deviceorientation", (e) => {
            if (e.beta == null || e.gamma == null) return;
            if (!base) base = { beta: e.beta, gamma: e.gamma }; // a posição em que a pessoa segura vira o "centro"
            const x = Math.max(-1, Math.min(1, (e.gamma - base.gamma) / 25));
            const y = Math.max(-1, Math.min(1, (e.beta - base.beta) / 25));
            cancelAnimationFrame(quadro);
            quadro = requestAnimationFrame(() => {
                hero.style.setProperty("--incl-x", x.toFixed(3));
                hero.style.setProperty("--incl-y", y.toFixed(3));
            });
        });
        // de tempos em tempos o "centro" acompanha devagar a posição atual, pra não ficar torto
        setInterval(() => { base = null; }, 12000);
    }

    /* 2) Balançar o celular = "Me surpreenda": abre um projeto aleatório */
    let ultimoPico = 0, picos = 0, ultimoSurpresa = 0, anterior = null;
    window.addEventListener("devicemotion", (e) => {
        const a = e.accelerationIncludingGravity;
        if (!a || a.x == null) return;
        if (anterior) {
            const delta = Math.abs(a.x - anterior.x) + Math.abs(a.y - anterior.y) + Math.abs(a.z - anterior.z);
            const agora = Date.now();
            if (delta > 28) {
                picos = agora - ultimoPico < 450 ? picos + 1 : 1;
                ultimoPico = agora;
                if (picos >= 3 && agora - ultimoSurpresa > 3000 && typeof window.surpreenderProjeto === "function") {
                    ultimoSurpresa = agora;
                    picos = 0;
                    vibrar([30, 40, 30]);
                    som("surpresa");
                    window.surpreenderProjeto();
                }
            }
        }
        anterior = { x: a.x, y: a.y, z: a.z };
    });

    /* 3) Vibradinha ao tocar em botões e links (Android; o iPhone não deixa site vibrar) */
    document.addEventListener("click", (e) => { if (e.target.closest(INTERATIVO)) vibrar(8); }, true);

    /* 4) Dois dedos deslizando pro lado: pula pra próxima seção (ou volta)
       7) Dois dedos tocam um acorde; três dedos, um arpejo */
    let gesto = null;
    document.addEventListener("touchstart", (e) => {
        const n = e.touches.length;
        if (n === 2 || n === 3) {
            const pts = [...e.touches];
            gesto = { n, x: pts.reduce((s, t) => s + t.clientX, 0) / n, y: pts.reduce((s, t) => s + t.clientY, 0) / n, t: Date.now() };
            if (n === 2) som("acorde"); else som("arpejo");
            vibrar(12);
        }
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        if (!gesto || e.touches.length < 2) return;
        const pts = [...e.touches];
        gesto.ux = pts.reduce((s, t) => s + t.clientX, 0) / pts.length;
        gesto.uy = pts.reduce((s, t) => s + t.clientY, 0) / pts.length;
    }, { passive: true });
    document.addEventListener("touchend", () => {
        if (!gesto || gesto.ux == null) { if (gesto && Date.now() - gesto.t > 50) gesto = null; return; }
        const dx = gesto.ux - gesto.x, dy = gesto.uy - gesto.y;
        const n = gesto.n;
        gesto = null;
        if (n !== 2 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        const meio = window.scrollY + window.innerHeight / 2;
        const tops = SECOES.map((id) => document.getElementById(id)).filter(Boolean).map((el) => ({ el, top: el.getBoundingClientRect().top + window.scrollY }));
        let atual = 0;
        tops.forEach((s, i) => { if (s.top <= meio) atual = i; });
        const alvo = tops[Math.max(0, Math.min(tops.length - 1, atual + (dx < 0 ? 1 : -1)))];
        if (!alvo || alvo === tops[atual]) return;
        som("passagem");
        vibrar(15);
        alvo.el.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth" });
    }, { passive: true });

    /* 5) Segurar o dedo num projeto: abre a prévia dele na janelinha, sem sair da página */
    let segurando = null;
    document.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) { clearTimeout(segurando && segurando.timer); segurando = null; return; }
        const card = e.target.closest(".card-projeto");
        if (!card || e.target.closest(INTERATIVO)) return;
        const t = e.touches[0];
        segurando = {
            x: t.clientX, y: t.clientY, card, abriu: false,
            timer: setTimeout(() => {
                const demo = card.querySelector("[data-demo]");
                if (!demo) return;
                segurando.abriu = true;
                vibrar(25);
                som("subida");
                demo.click();
            }, 550),
        };
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        if (!segurando) return;
        const t = e.touches[0];
        if (Math.hypot(t.clientX - segurando.x, t.clientY - segurando.y) > 10) { clearTimeout(segurando.timer); segurando = null; }
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
        if (!segurando) return;
        clearTimeout(segurando.timer);
        if (segurando.abriu) e.preventDefault(); // não deixa o toque "vazar" pra algo embaixo depois de abrir
        segurando = null;
    });
    document.addEventListener("contextmenu", (e) => { if (e.target.closest(".card-projeto")) e.preventDefault(); });

    /* 6) Puxar pra baixo no topo: em vez de recarregar, toca uma subida e manda um recado */
    let puxando = null, ultimoPuxar = 0;
    document.addEventListener("touchstart", (e) => {
        puxando = window.scrollY <= 0 && e.touches.length === 1 ? { y: e.touches[0].clientY } : null;
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        if (!puxando || e.touches.length !== 1) return;
        const dy = e.touches[0].clientY - puxando.y;
        document.documentElement.style.setProperty("--puxar", Math.max(0, Math.min(1, dy / 110)).toFixed(3));
        if (dy > 110 && !puxando.foi && Date.now() - ultimoPuxar > 4000) {
            puxando.foi = true;
            ultimoPuxar = Date.now();
            vibrar(20);
            som("subida");
            toast("✨ Bora criar algo juntos? Me chama no WhatsApp!");
        }
    }, { passive: true });
    document.addEventListener("touchend", () => { document.documentElement.style.setProperty("--puxar", "0"); }, { passive: true });

    /* 9) Botão flutuante com texto e mensagem de WhatsApp de acordo com o que a pessoa está vendo */
    const fixo = document.querySelector(".orcamento-fixo");
    if (fixo && "IntersectionObserver" in window) {
        const padrao = { texto: fixo.textContent, href: fixo.getAttribute("href") };
        const whats = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
        let secao = "inicio", card = null;
        function atualizar() {
            let texto = padrao.texto, href = padrao.href, externo = false;
            if ((secao === "projetos" || secao === "mais-projetos") && card) {
                const nome = card.querySelector(".projeto-nome")?.textContent.trim() || "um dos projetos";
                texto = "💬 Quero um assim"; externo = true;
                href = whats(`Oi, Samuel! Vi o ${nome} no seu portfólio e quero algo parecido pro meu negócio.`);
            } else if (secao === "projetos" || secao === "mais-projetos") {
                texto = "💬 Quero um assim"; externo = true;
                href = whats("Oi, Samuel! Vi seus projetos no portfólio e quero algo parecido pro meu negócio.");
            } else if (secao === "servicos") {
                texto = "💬 Falar dos pacotes"; externo = true;
                href = whats("Oi, Samuel! Vi os pacotes no seu portfólio e quero saber qual combina comigo.");
            } else if (secao === "orcamento") {
                texto = "💬 Tirar dúvida"; externo = true;
                href = whats("Oi, Samuel! Antes de pedir o orçamento, tenho uma dúvida: ");
            }
            fixo.textContent = texto;
            fixo.href = href;
            if (externo) { fixo.target = "_blank"; fixo.rel = "noopener noreferrer"; }
            else { fixo.removeAttribute("target"); fixo.removeAttribute("rel"); }
            fixo.classList.toggle("fixo-whats", externo);
        }
        const meio = { rootMargin: "-45% 0px -45% 0px" };
        const obsSecao = new IntersectionObserver((entradas) => {
            entradas.forEach((e) => { if (e.isIntersecting) { secao = e.target.id; atualizar(); } });
        }, meio);
        SECOES.forEach((id) => { const el = document.getElementById(id); if (el) obsSecao.observe(el); });
        const obsCard = new IntersectionObserver((entradas) => {
            entradas.forEach((e) => { if (e.isIntersecting) card = e.target; else if (card === e.target) card = null; });
            atualizar();
        }, { rootMargin: "-40% 0px -40% 0px" });
        document.querySelectorAll(".card-projeto").forEach((c) => obsCard.observe(c));
    }

    /* 10) Instalar o portfólio na tela inicial, como app */
    const instalar = document.getElementById("botaoInstalar");
    const jaInstalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (instalar && !jaInstalado) {
        let pedido = null;
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); pedido = e; });
        instalar.hidden = false;
        instalar.addEventListener("click", () => {
            if (pedido) {
                pedido.prompt();
                pedido.userChoice.then((r) => { if (r.outcome === "accepted") { instalar.hidden = true; som("subida"); } pedido = null; });
            } else if (ios) {
                toast("No Safari: toque em Compartilhar (quadrado com a seta) e depois em “Adicionar à Tela de Início”.");
            } else {
                toast("No menu do navegador (⋮), toque em “Adicionar à tela inicial” ou “Instalar app”.");
            }
        });
        window.addEventListener("appinstalled", () => { instalar.hidden = true; });
    }
})();
