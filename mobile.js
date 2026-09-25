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
        if (n === 2 && e.target.closest(".projeto-visual")) { gesto = null; return; } // vira pinça de zoom (mais abaixo)
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
        const whats = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg + (window.linhaFavoritos ? window.linhaFavoritos() : ""))}`;
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

/* ---------- Segunda leva do celular (sem pedir permissão nenhuma) ----------
   1 stories dos projetos · 2 celular deitado = vitrine · 3 jogo Genius escondido no logo · 4 toque duplo
   curte o projeto · 5 descobrir projetos arrastando (tipo Tinder) · 6 mandar pro sócio · 7 continuar de
   onde parou · 8 pinça pra dar zoom nos prints · 9 luz do topo conforme a hora · 10 título da aba chamando */
(function () {
    "use strict";
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const som = (nome, ...args) => { if (window.musicaSite && window.musicaSite[nome]) window.musicaSite[nome](...args); };
    const vibrar = (p) => { if (navigator.vibrate) navigator.vibrate(p); };
    const toast = (t) => { if (typeof window.mostrarToast === "function") window.mostrarToast(t); };
    const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; } };
    const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const WHATS = "5567996034205";
    const INTERATIVO = "a[href], button, summary, label, input, textarea, select, [role='button']";

    // Os projetos, lidos dos próprios cards (entra projeto novo, entra aqui sozinho)
    const cards = [...document.querySelectorAll(".card-projeto")];
    const projetos = cards.map((card) => ({
        card,
        nome: card.querySelector(".projeto-nome")?.textContent.trim() || "Projeto",
        tag: card.querySelector(".tag")?.textContent.trim() || "",
        frase: card.querySelector(".titulo-beneficio")?.textContent.trim() || "",
        cor: card.style.getPropertyValue("--cor") || "#ff2a3d",
        link: card.querySelector(".link-projeto")?.getAttribute("href") || "#projetos",
        imagens: [...card.querySelectorAll(".tela-celular img, .print-janela img")].map((i) => i.getAttribute("src")),
    })).filter((p) => p.imagens.length);
    const whats = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg + linhaFavoritos())}`;
    const abrirOverlay = (o) => { o.hidden = false; document.body.style.overflow = "hidden"; };
    const fecharOverlay = (o) => { o.hidden = true; document.body.style.overflow = ""; };

    /* 4) Favoritos (toque duplo no card ou arrastando pra direita no modo Descobrir) */
    let favoritos = ler("portfolio-favoritos", []);
    function linhaFavoritos() { return favoritos.length ? `\n\nProjetos que curti no portfólio: ${favoritos.join(", ")}.` : ""; }
    window.linhaFavoritos = linhaFavoritos;
    function marcarCards() {
        projetos.forEach((p) => {
            let selo = p.card.querySelector(".fav-selo");
            const fav = favoritos.includes(p.nome);
            if (fav && !selo) { selo = el("span", "fav-selo", "❤"); selo.setAttribute("aria-label", "Nos seus favoritos"); p.card.querySelector(".projeto-visual").append(selo); }
            if (!fav && selo) selo.remove();
        });
    }
    function favoritar(nome, forcar) {
        const ja = favoritos.includes(nome);
        if (ja && forcar === true) return;
        favoritos = ja ? favoritos.filter((n) => n !== nome) : [...favoritos, nome];
        gravar("portfolio-favoritos", favoritos);
        marcarCards();
        if (!ja) { som("curtir"); vibrar(15); }
        return !ja;
    }
    marcarCards();
    // no orçamento, a mensagem pro WhatsApp já sai com os favoritos
    const orc = document.getElementById("orcamentoApp");
    if (orc) new MutationObserver(() => {
        const campo = orc.querySelector("textarea.orc-mensagem");
        if (!campo || campo.dataset.favoritos || !favoritos.length) return;
        campo.dataset.favoritos = "1";
        campo.value += linhaFavoritos();
        campo.dispatchEvent(new Event("input"));
    }).observe(orc, { childList: true, subtree: true });

    let ultimoToque = { t: 0, card: null };
    document.addEventListener("touchend", (e) => {
        if (e.changedTouches.length !== 1 || e.touches.length) return;
        const card = e.target.closest(".card-projeto");
        if (!card || e.target.closest(INTERATIVO)) { ultimoToque.card = null; return; }
        const agora = Date.now();
        if (ultimoToque.card === card && agora - ultimoToque.t < 320) {
            e.preventDefault();
            ultimoToque.card = null;
            const p = projetos.find((x) => x.card === card);
            if (!p) return;
            const t = e.changedTouches[0];
            const coracao = el("span", "coracao-voa", "❤");
            coracao.style.left = t.clientX + "px";
            coracao.style.top = t.clientY + "px";
            coracao.addEventListener("animationend", () => coracao.remove(), { once: true });
            document.body.append(coracao);
            const entrou = favoritar(p.nome);
            toast(entrou ? `❤ ${p.nome} nos favoritos (${favoritos.length}). Vai junto no pedido de orçamento.` : `${p.nome} saiu dos favoritos.`);
        } else ultimoToque = { t: agora, card };
    });

    /* 1) Stories dos projetos */
    if (projetos.length) {
        const vistos = new Set(ler("portfolio-stories-vistos", []));
        const faixa = el("div", "stories");
        faixa.setAttribute("aria-label", "Stories dos projetos");
        projetos.forEach((p, i) => {
            const b = el("button", "story" + (vistos.has(p.nome) ? " visto" : ""),
                `<span class="story-anel" style="--cor:${esc(p.cor)}"><img src="${esc(p.imagens[0])}" alt="" loading="lazy" decoding="async"></span><span class="story-nome">${esc(p.nome)}</span>`);
            b.type = "button";
            b.setAttribute("aria-label", `Ver story de ${p.nome}`);
            b.addEventListener("click", () => abrirStory(i));
            faixa.append(b);
        });
        document.querySelector(".hero-acoes")?.after(faixa);

        const ov = el("div", "stories-overlay", `
            <div class="st-barras"></div>
            <div class="st-topo"><span class="st-avatar"></span><div><b class="st-nome"></b><span class="st-tag"></span></div><button type="button" class="st-fechar" aria-label="Fechar">✕</button></div>
            <div class="st-palco"><img class="st-fundo" alt=""><img class="st-img" alt=""></div>
            <p class="st-frase"></p>
            <div class="st-acoes"><a class="st-testar" target="_blank" rel="noopener noreferrer">Testar agora ↗</a><a class="st-quero" target="_blank" rel="noopener noreferrer">💬 Quero um assim</a></div>
            <button type="button" class="st-lado st-voltar" aria-label="Anterior"></button><button type="button" class="st-lado st-avancar" aria-label="Próximo"></button>`);
        ov.hidden = true;
        ov.setAttribute("role", "dialog");
        ov.setAttribute("aria-modal", "true");
        ov.setAttribute("aria-label", "Stories dos projetos");
        document.body.append(ov);
        const q = (s) => ov.querySelector(s);
        const DURACAO = 3800;
        let pi = 0, si = 0, inicio = 0, pausado = false, pausaEm = 0, quadro = 0;

        function mostrar() {
            const p = projetos[pi];
            vistos.add(p.nome);
            gravar("portfolio-stories-vistos", [...vistos]);
            faixa.children[pi]?.classList.add("visto");
            q(".st-barras").innerHTML = p.imagens.map((_, k) => `<i><b style="width:${k < si ? 100 : 0}%"></b></i>`).join("");
            q(".st-avatar").style.backgroundImage = `url("${p.imagens[0]}")`;
            q(".st-avatar").style.setProperty("--cor", p.cor);
            q(".st-nome").textContent = p.nome;
            q(".st-tag").textContent = p.tag;
            q(".st-frase").textContent = p.frase;
            q(".st-img").src = p.imagens[si];
            q(".st-fundo").src = p.imagens[si];
            q(".st-testar").href = p.link;
            q(".st-quero").href = whats(`Oi, Samuel! Vi o story do ${p.nome} no seu portfólio e quero algo parecido pro meu negócio.`);
            ov.style.setProperty("--cor", p.cor);
            inicio = performance.now();
        }
        function passo(d) {
            const p = projetos[pi];
            si += d;
            if (si >= p.imagens.length) { pi++; si = 0; if (pi >= projetos.length) return fechar(); som("passagem"); }
            else if (si < 0) { pi = Math.max(0, pi - 1); si = 0; }
            mostrar();
        }
        function rodar(agora) {
            if (ov.hidden) return;
            if (!pausado) {
                const prog = Math.min(1, (agora - inicio) / DURACAO);
                const barra = q(".st-barras").children[si]?.firstChild;
                if (barra) barra.style.width = prog * 100 + "%";
                if (prog >= 1) passo(1);
            }
            quadro = requestAnimationFrame(rodar);
        }
        function abrirStory(i) { pi = i; si = 0; abrirOverlay(ov); mostrar(); som("subida"); cancelAnimationFrame(quadro); quadro = requestAnimationFrame(rodar); }
        function fechar() { cancelAnimationFrame(quadro); fecharOverlay(ov); }
        q(".st-fechar").addEventListener("click", fechar);
        // segurar pausa; toque rápido nas laterais avança/volta; arrastar pra baixo fecha
        let toque = null;
        ov.addEventListener("pointerdown", (e) => { if (e.target.closest(".st-acoes, .st-fechar")) return; toque = { t: performance.now(), y: e.clientY }; pausado = true; pausaEm = performance.now(); });
        ov.addEventListener("pointerup", (e) => {
            if (!toque) return;
            const segurou = performance.now() - toque.t > 280, desceu = e.clientY - toque.y > 90;
            inicio += performance.now() - pausaEm;
            pausado = false;
            toque = null;
            if (desceu) return fechar();
            if (!segurou && e.target.closest(".st-lado")) passo(e.target.closest(".st-avancar") ? 1 : -1);
        });
        document.addEventListener("keydown", (e) => { if (!ov.hidden && e.key === "Escape") fechar(); });
    }

    /* 2) Celular deitado: vitrine dos projetos em tela cheia (o CSS só mostra na horizontal) */
    if (projetos.length) {
        const vit = el("div", "vitrine", `<div class="vit-palco"><img class="vit-img" alt=""></div><div class="vit-info"><p class="vit-tag"></p><h2 class="vit-nome"></h2><p class="vit-frase"></p><div class="vit-pontos">${projetos.map(() => "<i></i>").join("")}</div><button type="button" class="vit-sair">Ver o site normal</button></div>`);
        vit.setAttribute("aria-hidden", "true");
        document.body.append(vit);
        const deitado = window.matchMedia("(orientation: landscape) and (max-height: 540px)");
        let vi = 0, vj = 0, relogio = 0;
        function mostrarVitrine() {
            const p = projetos[vi];
            vit.querySelector(".vit-img").src = p.imagens[vj % p.imagens.length];
            vit.querySelector(".vit-tag").textContent = p.tag;
            vit.querySelector(".vit-nome").textContent = p.nome;
            vit.querySelector(".vit-frase").textContent = p.frase;
            vit.style.setProperty("--cor", p.cor);
            [...vit.querySelectorAll(".vit-pontos i")].forEach((d, k) => d.classList.toggle("ativo", k === vi));
        }
        function avancar() { vj++; if (vj >= Math.min(2, projetos[vi].imagens.length)) { vj = 0; vi = (vi + 1) % projetos.length; som("passagem"); } mostrarVitrine(); }
        function atualizar() {
            clearInterval(relogio);
            if (deitado.matches && !document.documentElement.classList.contains("sem-vitrine")) {
                mostrarVitrine();
                if (!semMovimento) relogio = setInterval(avancar, 3200);
            }
            if (!deitado.matches) document.documentElement.classList.remove("sem-vitrine");
        }
        vit.querySelector(".vit-sair").addEventListener("click", () => { document.documentElement.classList.add("sem-vitrine"); atualizar(); });
        vit.addEventListener("click", (e) => { if (!e.target.closest(".vit-sair")) { clearInterval(relogio); avancar(); if (!semMovimento) relogio = setInterval(avancar, 3200); } });
        deitado.addEventListener("change", atualizar);
        atualizar();
    }

    /* 3) Jogo Genius escondido: 5 toques no logo "SM." */
    const logo = document.querySelector(".logo");
    if (logo) {
        const NOTAS = [72, 76, 79, 84];
        const g = el("div", "genius", `
            <div class="gn-topo"><b>Genius do Samuel</b><button type="button" class="gn-fechar" aria-label="Fechar jogo">✕</button></div>
            <p class="gn-status" aria-live="polite">Repita a sequência de cores e sons.</p>
            <div class="gn-pads">${NOTAS.map((_, i) => `<button type="button" class="gn-pad gn-${i}" data-i="${i}" aria-label="Cor ${i + 1}"></button>`).join("")}<button type="button" class="gn-centro">Jogar</button></div>
            <p class="gn-recorde"></p>`);
        g.hidden = true;
        g.setAttribute("role", "dialog");
        g.setAttribute("aria-modal", "true");
        g.setAttribute("aria-label", "Jogo Genius");
        document.body.append(g);
        let seq = [], vez = 0, ouvindo = false;
        const recorde = () => ler("portfolio-genius-recorde", 0);
        const status = (t) => { g.querySelector(".gn-status").textContent = t; };
        const mostrarRecorde = () => { g.querySelector(".gn-recorde").textContent = recorde() ? `Recorde: ${recorde()}` : ""; };
        function acender(i, dur) {
            const pad = g.querySelector(".gn-" + i);
            pad.classList.add("aceso");
            som("nota", NOTAS[i], 1);
            setTimeout(() => pad.classList.remove("aceso"), dur);
        }
        function tocarSequencia() {
            ouvindo = false;
            status(`Rodada ${seq.length}: preste atenção…`);
            const passo = Math.max(260, 620 - seq.length * 25);
            seq.forEach((n, k) => setTimeout(() => acender(n, passo * 0.7), 500 + k * passo));
            setTimeout(() => { ouvindo = true; vez = 0; status("Sua vez!"); }, 500 + seq.length * passo);
        }
        function novaRodada() { seq.push(Math.floor(Math.random() * 4)); tocarSequencia(); }
        g.querySelector(".gn-centro").addEventListener("click", () => { seq = []; g.querySelector(".gn-centro").hidden = true; novaRodada(); });
        g.querySelectorAll(".gn-pad").forEach((pad) => pad.addEventListener("pointerdown", () => {
            if (!ouvindo) return;
            const i = Number(pad.dataset.i);
            acender(i, 220);
            vibrar(8);
            if (i !== seq[vez]) {
                ouvindo = false;
                som("erro");
                vibrar([60, 40, 60]);
                const pontos = seq.length - 1;
                if (pontos > recorde()) gravar("portfolio-genius-recorde", pontos);
                status(`Errou! Você fez ${pontos} ${pontos === 1 ? "ponto" : "pontos"}.`);
                mostrarRecorde();
                g.querySelector(".gn-centro").textContent = "De novo";
                g.querySelector(".gn-centro").hidden = false;
                return;
            }
            vez++;
            if (vez === seq.length) { ouvindo = false; status("Boa! 🎉"); setTimeout(novaRodada, 700); }
        }));
        g.querySelector(".gn-fechar").addEventListener("click", () => { ouvindo = false; fecharOverlay(g); });
        let toques = [];
        logo.addEventListener("click", (e) => {
            const agora = Date.now();
            toques = toques.filter((t) => agora - t < 2500).concat(agora);
            if (toques.length >= 5) {
                e.preventDefault();
                toques = [];
                status("Repita a sequência de cores e sons.");
                g.querySelector(".gn-centro").textContent = "Jogar";
                g.querySelector(".gn-centro").hidden = false;
                mostrarRecorde();
                abrirOverlay(g);
                som("surpresa");
                vibrar([20, 30, 20]);
            }
        });
    }

    /* 5) Descobrir projetos arrastando: direita curte, esquerda passa */
    if (projetos.length) {
        const botao = el("button", "botao-descobrir", "🔥 Descobrir");
        botao.type = "button";
        document.querySelector(".filtros-projetos")?.append(botao);
        const deck = el("div", "deck", `
            <div class="dk-topo"><b>Arraste: ❤ curtir · ✕ passar</b><button type="button" class="dk-fechar" aria-label="Fechar">✕</button></div>
            <div class="dk-pilha"></div>
            <div class="dk-botoes"><button type="button" class="dk-nao" aria-label="Passar">✕</button><button type="button" class="dk-sim" aria-label="Curtir">❤</button></div>
            <div class="dk-fim" hidden></div>`);
        deck.hidden = true;
        deck.setAttribute("role", "dialog");
        deck.setAttribute("aria-modal", "true");
        deck.setAttribute("aria-label", "Descobrir projetos");
        document.body.append(deck);
        const pilha = deck.querySelector(".dk-pilha");
        let fila = [];
        function montar() {
            pilha.innerHTML = "";
            deck.querySelector(".dk-fim").hidden = true;
            deck.querySelector(".dk-botoes").hidden = false;
            fila = projetos.slice();
            fila.slice().reverse().forEach((p) => {
                const c = el("div", "dk-card", `<img src="${esc(p.imagens[0])}" alt=""><div class="dk-info"><p>${esc(p.tag)}</p><h3>${esc(p.nome)}</h3><span>${esc(p.frase)}</span></div><i class="dk-selo dk-selo-sim">CURTI</i><i class="dk-selo dk-selo-nao">PASSO</i>`);
                c.style.setProperty("--cor", p.cor);
                c.dataset.nome = p.nome;
                pilha.append(c);
            });
            prepararTopo();
        }
        function topo() { return pilha.lastElementChild; }
        function decidir(sim) {
            const c = topo();
            if (!c) return;
            c.style.transition = "transform .35s ease, opacity .35s ease";
            c.style.transform = `translateX(${sim ? 130 : -130}%) rotate(${sim ? 22 : -22}deg)`;
            c.style.opacity = "0";
            if (sim) favoritar(c.dataset.nome, true); else som("passar");
            setTimeout(() => { c.remove(); if (!topo()) fim(); else prepararTopo(); }, 330);
        }
        function prepararTopo() {
            const c = topo();
            if (!c) return;
            let x0 = null, dx = 0;
            c.onpointerdown = (e) => { x0 = e.clientX; c.setPointerCapture(e.pointerId); c.style.transition = "none"; };
            c.onpointermove = (e) => {
                if (x0 === null) return;
                dx = e.clientX - x0;
                c.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
                c.style.setProperty("--sim", Math.max(0, Math.min(1, dx / 100)));
                c.style.setProperty("--nao", Math.max(0, Math.min(1, -dx / 100)));
            };
            c.onpointerup = () => {
                if (x0 === null) return;
                x0 = null;
                if (Math.abs(dx) > 90) decidir(dx > 0);
                else { c.style.transition = "transform .25s ease"; c.style.transform = ""; c.style.setProperty("--sim", 0); c.style.setProperty("--nao", 0); }
                dx = 0;
            };
        }
        function fim() {
            deck.querySelector(".dk-botoes").hidden = true;
            const f = deck.querySelector(".dk-fim");
            f.hidden = false;
            f.innerHTML = favoritos.length
                ? `<p>Você curtiu:</p><b>${esc(favoritos.join(", "))}</b><a class="botao botao-principal" target="_blank" rel="noopener noreferrer" href="${whats("Oi, Samuel! Descobri seus projetos no portfólio e quero um orçamento.")}">💬 Pedir orçamento com esses</a><button type="button" class="botao botao-secundario dk-denovo">Ver de novo</button>`
                : `<p>Nenhum te pegou? Me conta o que você precisa que eu faço do zero.</p><a class="botao botao-principal" target="_blank" rel="noopener noreferrer" href="${whats("Oi, Samuel! Vi seus projetos e queria algo diferente: ")}">💬 Falar no WhatsApp</a><button type="button" class="botao botao-secundario dk-denovo">Ver de novo</button>`;
            f.querySelector(".dk-denovo").addEventListener("click", montar);
            som("subida");
        }
        botao.addEventListener("click", () => { montar(); abrirOverlay(deck); som("subida"); });
        deck.querySelector(".dk-sim").addEventListener("click", () => decidir(true));
        deck.querySelector(".dk-nao").addEventListener("click", () => decidir(false));
        deck.querySelector(".dk-fechar").addEventListener("click", () => fecharOverlay(deck));
    }

    /* 6) Mandar o portfólio pro sócio (gaveta de compartilhar do próprio celular) */
    const compartilhar = document.getElementById("botaoSocio");
    if (compartilhar) {
        compartilhar.hidden = false;
        compartilhar.addEventListener("click", async () => {
            const dados = { title: "Samuel Mickael | Sites e sistemas", text: "Olha esse dev de Campo Grande que faz sites, sistemas e apps. Dá pra testar os projetos direto no site:", url: "https://samueldevmi.github.io/portfolio/" };
            try {
                if (navigator.share) { await navigator.share(dados); som("subida"); }
                else { await navigator.clipboard.writeText(`${dados.text} ${dados.url}`); toast("Link copiado! É só colar na conversa com o seu sócio."); }
            } catch (e) { /* a pessoa fechou a gaveta */ }
        });
    }

    /* 7) Continuar de onde parou */
    if ("IntersectionObserver" in window) {
        const antes = ler("portfolio-onde-parou", null);
        let atual = { secao: "inicio", projeto: null };
        const salvar = () => gravar("portfolio-onde-parou", Object.assign({}, atual, { quando: Date.now() }));
        const meio = { rootMargin: "-45% 0px -45% 0px" };
        const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { atual.secao = e.target.id; if (e.target.id !== "projetos") atual.projeto = null; salvar(); } }), meio);
        ["inicio", "sobre-mim", "projetos", "mais-projetos", "servicos", "orcamento", "jornada", "contato"].forEach((id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
        const obsCard = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const p = projetos.find((x) => x.card === e.target); if (p) { atual.projeto = p.nome; salvar(); } } }), meio);
        projetos.forEach((p) => obsCard.observe(p.card));
        const NOMES = { "sobre-mim": "o Sobre mim", "mais-projetos": "os outros projetos", servicos: "os serviços", orcamento: "o orçamento", jornada: "a minha jornada", contato: "o contato", projetos: "os projetos" };
        if (antes && antes.secao !== "inicio" && Date.now() - antes.quando > 20 * 60 * 1000 && !location.hash) {
            const oque = antes.projeto ? `o ${antes.projeto}` : NOMES[antes.secao] || "o portfólio";
            const aviso = el("div", "continuar", `<span>👋 Da última vez você viu <b>${esc(oque)}</b>.</span><button type="button" class="ct-sim">Continuar</button><button type="button" class="ct-nao" aria-label="Dispensar">✕</button>`);
            aviso.setAttribute("role", "status");
            document.body.append(aviso);
            const tirar = () => { aviso.classList.add("saindo"); setTimeout(() => aviso.remove(), 300); };
            aviso.querySelector(".ct-nao").addEventListener("click", tirar);
            aviso.querySelector(".ct-sim").addEventListener("click", () => {
                const p = projetos.find((x) => x.nome === antes.projeto);
                (p ? p.card : document.getElementById(antes.secao))?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                som("subida");
                tirar();
            });
            setTimeout(tirar, 10000);
        }
    }

    /* 8) Pinça com dois dedos num print de projeto = zoom (solta e volta ao normal) */
    let pinca = null;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    document.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 2) return;
        const vis = e.target.closest(".projeto-visual");
        if (!vis) return;
        const img = e.target.closest("img") || vis.querySelector(".print-janela img, .tela-celular img");
        if (!img) return;
        const r = img.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2, my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        img.style.transformOrigin = `${((mx - r.left) / r.width) * 100}% ${((my - r.top) / r.height) * 100}%`;
        img.style.transition = "none";
        img.classList.add("em-zoom");
        pinca = { img, d0: dist(e.touches) };
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        if (!pinca || e.touches.length !== 2) return;
        const escala = Math.max(1, Math.min(3, dist(e.touches) / pinca.d0));
        pinca.img.style.transform = `scale(${escala})`;
    }, { passive: true });
    document.addEventListener("touchend", () => {
        if (!pinca) return;
        const img = pinca.img;
        pinca = null;
        img.style.transition = "transform .3s ease";
        img.style.transform = "";
        setTimeout(() => img.classList.remove("em-zoom"), 300);
    }, { passive: true });

    /* 9) Luz do topo conforme a hora: manhã, tarde ou noite */
    const hora = new Date().getHours();
    document.documentElement.classList.add(hora >= 5 && hora < 12 ? "luz-manha" : hora >= 12 && hora < 18 ? "luz-tarde" : "luz-noite");
    const hero = document.querySelector(".hero");
    if (hero) hero.prepend(el("div", "luz-do-dia"));
})();

/* ---------- Terceira leva do celular: ondinha no toque, rodapé elástico, ideia por voz, calculadora,
   barra de navegação tipo app e corte de HQ entre seções ---------- */
(function () {
    "use strict";
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const som = (nome) => { if (window.musicaSite && window.musicaSite[nome]) window.musicaSite[nome](); };
    const vibrar = (p) => { if (navigator.vibrate) navigator.vibrate(p); };
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const WHATS = "5567996034205";
    const whats = (msg) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg + (window.linhaFavoritos ? window.linhaFavoritos() : ""))}`;
    const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

    /* 1) Ondinha de luz onde o dedo encosta */
    if (!semMovimento) {
        let ondas = 0;
        document.addEventListener("touchstart", (e) => {
            if (ondas > 6) return;
            [...e.changedTouches].forEach((t) => {
                const o = el("span", "onda-toque");
                o.style.left = t.clientX + "px";
                o.style.top = t.clientY + "px";
                ondas++;
                o.addEventListener("animationend", () => { o.remove(); ondas--; }, { once: true });
                document.body.append(o);
            });
        }, { passive: true });
    }

    /* 2) No fim da página, puxar mais um pouco estica o rodapé como elástico */
    const fim = el("div", "fim-elastico", "<span>🕸️ Chegou no fim! Solta que eu te devolvo.</span>");
    fim.setAttribute("aria-hidden", "true");
    document.body.append(fim);
    let puxar = null;
    const noFim = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    document.addEventListener("touchstart", (e) => { puxar = e.touches.length === 1 && noFim() ? { y: e.touches[0].clientY, max: 0 } : null; }, { passive: true });
    document.addEventListener("touchmove", (e) => {
        if (!puxar || e.touches.length !== 1) return;
        const dy = puxar.y - e.touches[0].clientY; // dedo subindo = puxando o fim
        if (dy <= 0) return;
        const esticar = Math.min(130, dy * 0.45);
        puxar.max = Math.max(puxar.max, esticar);
        fim.style.transition = "none";
        fim.style.height = esticar + "px";
    }, { passive: true });
    document.addEventListener("touchend", () => {
        if (!puxar) return;
        if (puxar.max > 60) { som("mola"); vibrar([10, 30, 10]); }
        puxar = null;
        fim.style.transition = "height .45s cubic-bezier(.3, 1.6, .5, 1)";
        fim.style.height = "0px";
    }, { passive: true });

    /* 5) Contar a ideia do seu jeito (o microfone do teclado do celular vira ditado) */
    const tituloOrc = document.querySelector(".orcamento-titulo");
    if (tituloOrc) {
        const caixa = el("div", "ideia-voz", `
            <p class="ideia-titulo">🎙️ Prefere falar?</p>
            <p class="ideia-ajuda">Toque no campo e aperte o <b>microfone do teclado</b>. Fala do seu jeito que o texto sai pronto pro WhatsApp.</p>
            <textarea rows="4" maxlength="1200" placeholder="Ex.: tenho uma pizzaria e queria um site pros clientes pedirem pelo WhatsApp…" aria-label="Conte sua ideia"></textarea>
            <a class="botao botao-principal" target="_blank" rel="noopener noreferrer">💬 Mandar minha ideia</a>`);
        tituloOrc.after(caixa);
        const campo = caixa.querySelector("textarea"), botao = caixa.querySelector("a");
        const atualizar = () => {
            const ideia = campo.value.trim();
            botao.href = whats(ideia ? `Oi, Samuel! Minha ideia é essa: ${ideia}` : "Oi, Samuel! Quero te contar uma ideia: ");
            botao.classList.toggle("ideia-pronta", ideia.length > 10);
        };
        campo.addEventListener("input", atualizar);
        atualizar();
    }

    /* 7) Calculadora: quanto você deixa de ganhar sem site */
    const servicos = document.querySelector("#servicos .lista-servicos");
    if (servicos) {
        const TIPOS = { "Loja de roupa ou acessórios": 120, "Restaurante, lanchonete ou doceria": 60, "Salão, barbearia ou estética": 70, "Clínica ou consultório": 200, "Prestador de serviço": 250, "Outro": 100 };
        const calc = el("div", "calc-perda", `
            <p class="calc-titulo">🧮 Quanto você deixa de ganhar sem site?</p>
            <label>Seu negócio<select>${Object.keys(TIPOS).map((t) => `<option>${t}</option>`).join("")}</select></label>
            <label>Clientes que você perde por mês <b class="calc-qtd">5</b><input type="range" min="1" max="40" value="5"></label>
            <label>Quanto cada cliente gasta, em média<span class="calc-real"><span>R$</span><input type="number" inputmode="numeric" min="1" max="100000" value="120"></span></label>
            <div class="calc-resultado" aria-live="polite"></div>
            <a class="botao botao-principal" href="#orcamento">Quero parar de perder</a>
            <p class="calc-nota">É uma estimativa, só pra ter ideia do tamanho da coisa.</p>`);
        servicos.after(calc);
        const sel = calc.querySelector("select"), faixa = calc.querySelector('input[type="range"]'), ticket = calc.querySelector('input[type="number"]');
        const conta = () => {
            const qtd = Number(faixa.value), valor = Math.max(0, Number(ticket.value) || 0);
            calc.querySelector(".calc-qtd").textContent = qtd;
            const mes = qtd * valor, ano = mes * 12;
            const pagaCom = valor ? Math.max(1, Math.ceil(250 / valor)) : 0;
            calc.querySelector(".calc-resultado").innerHTML = valor
                ? `Você deixa de ganhar uns <b>${brl(mes)}</b> por mês, ou <b>${brl(ano)}</b> por ano.<br>Um site a partir de R$ 250 se paga com <b>${pagaCom} ${pagaCom === 1 ? "cliente" : "clientes"}</b>.`
                : "Coloque quanto cada cliente gasta pra ver a conta.";
        };
        sel.addEventListener("change", () => { ticket.value = TIPOS[sel.value]; conta(); });
        faixa.addEventListener("input", conta);
        ticket.addEventListener("input", conta);
        conta();
    }

    /* 9) Barra de navegação embaixo, tipo aplicativo */
    const ITENS = [
        ["inicio", "Início", '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>'],
        ["projetos", "Projetos", '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'],
        ["orcamento", "Orçamento", '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M9 11h7M9 15h7M9 7.5h3"/>'],
        ["contato", "Contato", '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.5z"/>'],
    ];
    const barra = el("nav", "barra-app", ITENS.map(([id, nome, svg]) => `<a href="#${id}" data-secao="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg><span>${nome}</span></a>`).join(""));
    barra.setAttribute("aria-label", "Navegação rápida");
    document.body.append(barra);
    document.documentElement.classList.add("tem-barra-app");
    if ("IntersectionObserver" in window) {
        const mapa = { inicio: "inicio", "sobre-mim": "inicio", projetos: "projetos", "mais-projetos": "projetos", servicos: "orcamento", orcamento: "orcamento", jornada: "contato", contato: "contato" };
        const obs = new IntersectionObserver((es) => es.forEach((e) => {
            if (!e.isIntersecting) return;
            barra.querySelectorAll("a").forEach((a) => a.classList.toggle("ativo", a.dataset.secao === mapa[e.target.id]));
        }), { rootMargin: "-45% 0px -45% 0px" });
        Object.keys(mapa).forEach((id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
    }

    /* 10) Pular de seção pelo menu faz um corte de HQ ("BAM!", "ZIP!", "POW!"...) */
    const ONOMATOPEIAS = ["BAM!", "ZIP!", "POW!", "THWIP!", "ZAP!", "BOOM!", "VUPT!"];
    const hq = el("div", "hq-corte", '<span class="hq-balao"></span>');
    hq.setAttribute("aria-hidden", "true");
    document.body.append(hq);
    let hqAnterior = -1;
    document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link || semMovimento) return;
        const id = link.getAttribute("href").slice(1);
        const alvo = id && document.getElementById(id);
        if (!alvo || !alvo.matches("section, header, main > *")) return;
        e.preventDefault();
        let i;
        do { i = Math.floor(Math.random() * ONOMATOPEIAS.length); } while (i === hqAnterior);
        hqAnterior = i;
        hq.querySelector(".hq-balao").textContent = ONOMATOPEIAS[i];
        hq.style.setProperty("--giro", (Math.random() * 16 - 8).toFixed(1) + "deg");
        hq.classList.remove("ativo");
        void hq.offsetWidth;
        hq.classList.add("ativo");
        som("hq");
        vibrar(18);
        setTimeout(() => {
            alvo.scrollIntoView({ behavior: "auto" });
            history.replaceState(null, "", "#" + id);
        }, 200);
    }, true);
})();

/* ---------- Quarta leva do celular: o cartão de visita ----------
   Enquanto a pessoa navega, o site guarda (só neste aparelho) quais seções e projetos ela viu. No fim,
   um botão gera na hora — via <canvas>, sem servidor — um cartão personalizado com esse resumo, nas
   cores do site. Dá pra baixar ou mandar direto pela gaveta de compartilhar do celular. */
(function () {
    "use strict";
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const botao = document.getElementById("botaoResumo");
    if (!botao || !window.HTMLCanvasElement) return;

    const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; } };
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const som = (nome) => { if (window.musicaSite && window.musicaSite[nome]) window.musicaSite[nome](); };
    const vibrar = (p) => { if (navigator.vibrate) navigator.vibrate(p); };

    const inicio = Date.now();
    const SECOES = ["inicio", "sobre-mim", "projetos", "mais-projetos", "servicos", "orcamento", "jornada", "contato"];
    const secoesVistas = new Set();
    const projetosVistos = new Set();
    if ("IntersectionObserver" in window) {
        const obsSecao = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) secoesVistas.add(e.target.id); }), { threshold: 0.35 });
        SECOES.forEach((id) => { const s = document.getElementById(id); if (s) obsSecao.observe(s); });
        const obsCard = new IntersectionObserver((es) => es.forEach((e) => {
            if (!e.isIntersecting) return;
            const nome = e.target.querySelector(".projeto-nome")?.textContent.trim();
            if (nome) projetosVistos.add(nome);
        }), { threshold: 0.4 });
        document.querySelectorAll(".card-projeto").forEach((c) => obsCard.observe(c));
    }
    botao.hidden = false;

    /* Corta o texto (com "…") pra caber na largura, medindo de verdade em vez de chutar */
    function truncar(ctx, texto, larguraMax) {
        if (ctx.measureText(texto).width <= larguraMax) return texto;
        let t = texto;
        while (t.length > 1 && ctx.measureText(t + "…").width > larguraMax) t = t.slice(0, -1);
        return t + "…";
    }

    /* Desenha um dos ícones do site (mesmo <path> das tech badges) dentro do canvas do cartão-resumo,
       em vez de ctx.fillText(emoji): assim o cartão baixado fica igual em qualquer aparelho, em vez de
       depender da fonte de emoji do sistema de quem gerou. */
    function desenharIconeCanvas(ctx, nome, cx, cy, tamanho, cor, preenchido) {
        const d = window.IconesTema && window.IconesTema.CAMINHOS[nome];
        if (!d) return;
        ctx.save();
        ctx.translate(cx - tamanho / 2, cy - tamanho / 2);
        ctx.scale(tamanho / 24, tamanho / 24);
        const caminho = new Path2D(d);
        if (preenchido) { ctx.fillStyle = cor; ctx.fill(caminho); }
        else { ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(caminho); }
        ctx.restore();
    }

    /* O ícone do Genius usa as 4 cores do próprio jogo, em vez do traço vermelho/branco padrão */
    function desenharGridGenius(ctx, cx, cy, tamanho) {
        const cores = ["#ff2a3d", "#f6f6f6", "#8b1a1a", "#6e6e72"];
        const g = tamanho * 0.42, gap = tamanho * 0.12, x0 = cx - tamanho / 2, y0 = cy - tamanho / 2;
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([cx2, cy2], i) => {
            retanguloArredondado(ctx, x0 + cx2 * (g + gap), y0 + cy2 * (g + gap), g, g, tamanho * 0.08);
            ctx.fillStyle = cores[i]; ctx.fill();
        });
    }

    /* Desenha um retângulo com cantos arredondados (fallback pra quem não tem roundRect nativo) */
    function retanguloArredondado(ctx, x, y, w, h, r) {
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    /* Monta as linhas do resumo com base no que a pessoa realmente fez nesta visita */
    function montarStats() {
        const minutos = Math.max(1, Math.round((Date.now() - inicio) / 60000));
        const favoritos = ler("portfolio-favoritos", []);
        const genius = ler("portfolio-genius-recorde", 0);
        const stories = ler("portfolio-stories-vistos", []);
        const linhas = [
            ["pino", "Seções exploradas", `${secoesVistas.size} de ${SECOES.length}`],
            ["frasco", "Projetos testados", String(projetosVistos.size || 0)],
        ];
        if (favoritos.length) linhas.push(["coracao", "Favoritos", String(favoritos.length)]);
        if (stories.length) linhas.push(["camadas", "Stories vistos", String(stories.length)]);
        if (genius > 0) linhas.push(["genius", "Recorde no Genius", `${genius} rodada${genius === 1 ? "" : "s"}`]);
        linhas.push(["relogio", "Tempo explorando", `${minutos} min`]);
        let selo = "deu uma passada 👀";
        if (favoritos.length >= 2 || projetosVistos.size >= 4) selo = "curtiu mesmo mesmo 🔥";
        else if (minutos >= 5 || secoesVistas.size >= 6) selo = "explorou tudo 🕵️";
        else if (genius > 0) selo = "achou o easter egg 🎮";
        return { minutos, linhas: linhas.slice(0, 6), selo, projetos: [...projetosVistos], favoritos };
    }

    /* Desenha o cartão inteiro num canvas de alta resolução (1080x1350, proporção de story) */
    async function desenharCartao() {
        const { minutos, linhas, selo, projetos, favoritos } = montarStats();
        // altura do cartão acompanha quanto tem pra mostrar, em vez de deixar um vazio no fim
        const W = 1080;
        const H = 470 + linhas.length * 108 + (projetos.length ? 46 : 0) + (favoritos.length ? 46 : 0) + 188;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        try { await document.fonts.load('800 60px "Space Grotesk"'); await document.fonts.load('500 30px "DM Mono"'); } catch (e) { /* usa a fonte padrão do sistema */ }

        // fundo: carvão com glow vermelho, igual ao resto do site
        const fundo = ctx.createLinearGradient(0, 0, W, H);
        fundo.addColorStop(0, "#1e1e1e"); fundo.addColorStop(0.55, "#161616"); fundo.addColorStop(1, "#121212");
        ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H);
        const glow1 = ctx.createRadialGradient(120, 60, 0, 120, 60, 620);
        glow1.addColorStop(0, "rgba(139,26,26,.55)"); glow1.addColorStop(1, "rgba(139,26,26,0)");
        ctx.fillStyle = glow1; ctx.fillRect(0, 0, W, H);
        const glow2 = ctx.createRadialGradient(W - 80, H - 120, 0, W - 80, H - 120, 560);
        glow2.addColorStop(0, "rgba(139,37,37,.4)"); glow2.addColorStop(1, "rgba(139,37,37,0)");
        ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);
        // grade sutil, igual ao ::after do site
        ctx.strokeStyle = "rgba(255,42,61,.08)"; ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y <= H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        // cabeçalho: logo "SM." + selo do dia
        ctx.textBaseline = "alphabetic";
        ctx.font = '700 34px "Space Grotesk", Arial, sans-serif';
        ctx.fillStyle = "#f6f6f6"; ctx.fillText("SM", 72, 96);
        const larguraSM = ctx.measureText("SM").width;
        ctx.fillStyle = "#ff2a3d"; ctx.fillText(".", 72 + larguraSM, 96);
        ctx.font = '500 22px "DM Mono", monospace'; ctx.fillStyle = "#b0b0b0"; ctx.textAlign = "right";
        ctx.fillText("RESUMO DA VISITA", W - 72, 90);
        ctx.textAlign = "left";

        // selo em pílula
        ctx.font = '600 26px "DM Mono", monospace';
        const larguraSelo = ctx.measureText(selo).width + 48;
        retanguloArredondado(ctx, 72, 130, larguraSelo, 56, 28);
        ctx.fillStyle = "rgba(139,26,26,.5)"; ctx.fill();
        ctx.strokeStyle = "#ff2a3d"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.fillText(selo, 96, 166);

        // título grande
        ctx.font = '800 76px "Space Grotesk", Arial, sans-serif'; ctx.fillStyle = "#f6f6f6";
        const tit1 = `${minutos} min no site`, tit2 = "de Samuel Mickael.";
        ctx.fillText(tit1, 72, 300);
        ctx.save();
        ctx.shadowColor = "rgba(255,42,61,.55)"; ctx.shadowBlur = 26;
        ctx.fillStyle = "#ff2a3d"; ctx.fillText(tit2, 72, 380);
        ctx.restore();

        // linhas de estatística, em cartõezinhos
        let y = 470;
        ctx.font = '500 30px "DM Mono", monospace';
        linhas.forEach(([icone, rotulo, valor]) => {
            retanguloArredondado(ctx, 72, y, W - 144, 92, 20);
            ctx.fillStyle = "rgba(38,38,38,.85)"; ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.lineWidth = 1; ctx.stroke();
            if (icone === "genius") desenharGridGenius(ctx, 112, y + 46, 34);
            else if (icone === "coracao") desenharIconeCanvas(ctx, icone, 112, y + 46, 32, "#ff2a3d", true);
            else desenharIconeCanvas(ctx, icone, 112, y + 46, 32, "#f6f6f6", false);
            ctx.font = '600 30px "Space Grotesk", Arial, sans-serif'; ctx.fillStyle = "#e6e6e6"; ctx.fillText(rotulo, 162, y + 58);
            ctx.font = '500 28px "DM Mono", monospace'; ctx.fillStyle = "#ff2a3d";
            ctx.textAlign = "right"; ctx.fillText(valor, W - 100, y + 58); ctx.textAlign = "left";
            y += 108;
        });

        // rodapé: projetos testados e favoritos, cada um numa linha curta (com "…" se não couber)
        ctx.font = '500 26px "DM Mono", monospace'; ctx.fillStyle = "#8f8f8f";
        if (projetos.length) {
            ctx.fillText(truncar(ctx, "Testou: " + projetos.join(" · "), W - 144), 72, y + 20);
            y += 46;
        }
        if (favoritos.length) {
            ctx.fillText(truncar(ctx, "❤ " + favoritos.join(", "), W - 144), 72, y + 20);
            y += 46;
        }
        retanguloArredondado(ctx, 72, y + 40, W - 144, 78, 18);
        ctx.fillStyle = "rgba(255,42,61,.1)"; ctx.fill();
        ctx.strokeStyle = "rgba(255,42,61,.5)"; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = '600 30px "DM Mono", monospace'; ctx.fillStyle = "#ff2a3d";
        ctx.fillText("samueldevmi.github.io/portfolio", 96, y + 90);

        return canvas;
    }

    function mostrarOverlay(canvas) {
        const url = canvas.toDataURL("image/png");
        const overlay = el("div", "resumo-overlay", `
            <div class="resumo-caixa">
                <button type="button" class="resumo-fechar" aria-label="Fechar">✕</button>
                <img class="resumo-img" src="${url}" alt="Cartão-resumo da sua visita ao portfólio">
                <div class="resumo-acoes">
                    <button type="button" class="botao botao-principal resumo-compartilhar">Compartilhar</button>
                    <a class="botao botao-secundario resumo-baixar" download="resumo-portfolio-samuel-mickael.png" href="${url}">Baixar</a>
                </div>
            </div>`);
        document.body.append(overlay);
        document.body.style.overflow = "hidden";
        const fechar = () => { overlay.remove(); document.body.style.overflow = ""; };
        overlay.querySelector(".resumo-fechar").addEventListener("click", fechar);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(); });
        overlay.querySelector(".resumo-compartilhar").addEventListener("click", async () => {
            try {
                const blob = await (await fetch(url)).blob();
                const arquivo = new File([blob], "resumo-portfolio.png", { type: "image/png" });
                if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
                    await navigator.share({ files: [arquivo], title: "Meu resumo no portfólio do Samuel", text: "Olha o que eu explorei no portfólio dele:" });
                } else if (navigator.share) {
                    await navigator.share({ title: "Portfólio de Samuel Mickael", url: "https://samueldevmi.github.io/portfolio/" });
                } else {
                    overlay.querySelector(".resumo-baixar").click();
                }
                som("subida");
            } catch (e) { /* a pessoa fechou a gaveta de compartilhar */ }
        });
    }

    botao.addEventListener("click", async () => {
        botao.disabled = true;
        const textoOriginal = botao.textContent;
        botao.textContent = "Montando o cartão…";
        try {
            const canvas = await desenharCartao();
            mostrarOverlay(canvas);
            vibrar(20);
        } finally {
            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    });
})();
