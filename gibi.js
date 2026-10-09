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

    /* ---------- Foto desenhada: no toque/clique, mostra o modo desenho (e volta no próximo toque) ---------- */
    const avatar = document.querySelector(".avatar-hq");
    if (avatar) avatar.addEventListener("click", () => avatar.classList.toggle("real"));

    /* ---------- Easter egg: clicar no selo da edição ("#1") liga o modo preto e branco,
       tipo gibi velho xerocado. Guardado no aparelho pra continuar na próxima visita. */
    (function modoPB() {
        const selo = document.querySelector(".gibi-edicao");
        if (!selo) return;
        const CHAVE = "gibi-pb";
        const trama = document.createElement("div");
        trama.className = "gibi-pb-trama";
        trama.setAttribute("aria-hidden", "true");
        document.body.appendChild(trama);
        selo.removeAttribute("aria-hidden"); // vira botão de verdade: precisa ser visto por leitor de tela
        selo.setAttribute("role", "button");
        selo.setAttribute("tabindex", "0");
        selo.setAttribute("aria-pressed", "false");
        selo.setAttribute("aria-label", traduzir("Alternar modo preto e branco"));
        function aplicar(ligado) {
            raiz.classList.toggle("gibi-pb", ligado);
            selo.setAttribute("aria-pressed", String(ligado));
        }
        function alternar() {
            const ligado = !raiz.classList.contains("gibi-pb");
            aplicar(ligado);
            try { localStorage.setItem(CHAVE, ligado ? "1" : "0"); } catch (e) { /* sem armazenamento */ }
        }
        selo.addEventListener("click", alternar);
        selo.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            alternar();
        });
        try { if (localStorage.getItem(CHAVE) === "1") aplicar(true); } catch (e) { /* sem armazenamento */ }
    })();

    /* ---------- Contracapa: o ano do copyright ---------- */
    document.querySelectorAll(".cc-ano").forEach((el) => { el.textContent = new Date().getFullYear(); });

    /* ---------- Contato: sugestões de horário pra uma conversa de 15 min (a mensagem vai pronta) ---------- */
    (function agenda() {
        const caixa = document.querySelector(".agenda-horarios");
        const zap = document.querySelector('#contato a[href*="wa.me/"]');
        if (!caixa || !zap) return;
        const numero = new URL(zap.href).pathname.replace(/\D/g, "");
        const HORAS = ["10h", "19h"]; // sugestões; o Samuel confirma ou propõe outro
        const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
        const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
        const hoje = new Date();
        const dias = [];
        for (let d = 1; dias.length < 3 && d < 8; d++) {
            const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + d);
            if (dia.getDay() !== 0) dias.push(dia); // domingo fica de fora
        }
        dias.forEach((dia, n) => HORAS.forEach((hora) => {
            const curto = n === 0 && dia.getDate() === new Date(hoje.getTime() + 864e5).getDate() ? "amanhã" : `${SEMANA[dia.getDay()]} ${dia.getDate()}/${dia.getMonth() + 1}`;
            const longo = curto === "amanhã" ? "amanhã" : `${SEMANA_LONGA[dia.getDay()]} (${dia.getDate()}/${dia.getMonth() + 1})`;
            const a = document.createElement("a");
            a.className = "agenda-horario";
            a.target = "_blank"; a.rel = "noopener noreferrer";
            a.href = `https://wa.me/${numero}?text=${encodeURIComponent(`Oi, Samuel! Vi seu portfólio e queria conversar 15 min sobre um projeto. Pode ser ${longo} às ${hora}? Se não der, me sugere outro horário.`)}`;
            a.innerHTML = `<small>${curto}</small><b>${hora}</b>`;
            a.addEventListener("click", () => window.ESTATISTICAS?.contar("/evento/agenda-conversa", "pediu conversa de 15 min", true));
            caixa.appendChild(a);
        }));
    })();

    /* ---------- Edição especial secreta: digitar "gibi" (computador) ou tocar 5 vezes no "#1" da capa ----------
       Papel amarelado, cores desbotadas e o selo "EDIÇÃO RARA". Vale até fechar a aba. */
    (function edicaoRara() {
        const CHAVE = "portfolio-edicao-rara";
        let selo = null;
        function ligar(ligada, avisar) {
            raiz.classList.toggle("edicao-rara", ligada);
            try { ligada ? sessionStorage.setItem(CHAVE, "1") : sessionStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
            if (ligada && !selo) {
                selo = document.createElement("button");
                selo.type = "button";
                selo.className = "selo-rara";
                selo.innerHTML = "<b>Edição rara</b><small>1 de 1 · toque pra voltar</small>";
                selo.addEventListener("click", () => ligar(false));
                document.body.appendChild(selo);
            }
            if (selo) selo.hidden = !ligada;
            if (ligada && avisar) window.musicaSite?.surpresa?.();
        }
        try { if (sessionStorage.getItem(CHAVE)) ligar(true); } catch (e) { /* sem armazenamento */ }
        let digitado = "";
        document.addEventListener("keydown", (e) => {
            if (e.target.closest("input, textarea, select, [contenteditable]") || e.key.length !== 1) return;
            digitado = (digitado + e.key.toLowerCase()).slice(-4);
            if (digitado === "gibi") ligar(!raiz.classList.contains("edicao-rara"), true);
        });
        const capa = document.querySelector(".gibi-edicao");
        let toques = [];
        if (capa) capa.addEventListener("click", () => {
            const agora = Date.now();
            toques = toques.filter((t) => agora - t < 2500).concat(agora);
            if (toques.length >= 5) { toques = []; ligar(!raiz.classList.contains("edicao-rara"), true); }
        });
    })();

    if (semMovimento) return;

    /* ---------- Virar a página (computador): pular de seção pelo menu passa uma página de gibi pela tela ---------- */
    if (comMouse) {
        document.addEventListener("click", (e) => {
            const link = e.target.closest('.nav a[href^="#"], .nav-cta[href^="#"]');
            if (!link || link.getAttribute("href") === "#") return;
            const pagina = document.createElement("div");
            pagina.className = "gibi-pagina";
            pagina.setAttribute("aria-hidden", "true");
            pagina.addEventListener("animationend", () => pagina.remove());
            setTimeout(() => pagina.remove(), 1200); // se a animação não terminar (aba escondida), sai do mesmo jeito
            document.body.appendChild(pagina);
            window.musicaSite?.passar?.();
        });
    }

    /* ---------- Motoboy na barra de progresso: anda conforme a leitura e "entrega" no fim ---------- */
    (function motoboy() {
        const moto = document.createElement("div");
        moto.className = "motoboy";
        moto.setAttribute("aria-hidden", "true");
        moto.innerHTML = '<span class="motoboy-moto">🛵</span><span class="motoboy-balao">Entregue! ✓</span>';
        document.body.appendChild(moto);
        let quadro = 0, entregou = false;
        function andar() {
            quadro = 0;
            const total = document.documentElement.scrollHeight - innerHeight;
            const p = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
            moto.style.transform = `translateX(${(p * (innerWidth - 34)).toFixed(1)}px)`;
            moto.classList.toggle("visivel", scrollY > 160);
            const chegou = p > .985;
            if (chegou && !entregou) { entregou = true; moto.classList.add("entregue"); }
            else if (!chegou && entregou && p < .9) { entregou = false; moto.classList.remove("entregue"); }
        }
        addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(andar); }, { passive: true });
        addEventListener("resize", andar);
        andar();
    })();

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
        document.querySelectorAll(".gibi-legenda, .gibi-nota, .gibi-fim, .gibi-continua, .titulo-secao, .contato > h2, .marca-texto").forEach((el) => olho.observe(el));

        /* ---------- Dog-ear: a quina da página "vira" sempre que um título de seção nova aparece ---------- */
        const dogEar = document.createElement("div");
        dogEar.className = "gibi-dogear";
        dogEar.setAttribute("aria-hidden", "true");
        document.body.appendChild(dogEar);
        let virandoAgora = false;
        const olhoDogEar = new IntersectionObserver((entradas) => entradas.forEach((e) => {
            if (!e.isIntersecting || virandoAgora) return;
            virandoAgora = true;
            dogEar.classList.remove("vira"); void dogEar.offsetWidth; dogEar.classList.add("vira");
            setTimeout(() => { virandoAgora = false; }, 650);
        }), { threshold: .2 });
        document.querySelectorAll(".titulo-secao").forEach((el) => olhoDogEar.observe(el));

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
        const seletor = comMouse && e.pointerType === "mouse" ? "a, button, [role='button'], summary, .card-projeto" : ".botao-principal, .nav-cta, .orcamento-fixo, a[href*='wa.me/'], [data-orcamento-tipo]";
        if (!e.target.closest(seletor) || e.target.closest("input, textarea, select, .previa-site, .vitrine-palco")) return;
        const agora = performance.now();
        if (agora - ultimoPow < 160) return;
        ultimoPow = agora;
        const pow = document.createElement("span");
        pow.className = "gibi-pow";
        pow.setAttribute("aria-hidden", "true");
        // WhatsApp faz "ZAP!" (verde) e pedir orçamento faz "BORA!"; o resto sorteia
        const zap = e.target.closest('a[href*="wa.me/"]'), bora = !zap && e.target.closest('[data-orcamento-tipo], .card-orcamento, .orcamento-fixo, a[href="#orcamento"]');
        const lista = zap ? ["ZAP!", "PLIM!", "FIUUU!"] : bora ? ["BORA!", "FECHOU!", "VAMO!"] : ONOMATOPEIAS;
        if (zap) pow.classList.add("pow-zap"); else if (bora) pow.classList.add("pow-bora");
        pow.textContent = lista[Math.floor(Math.random() * lista.length)];
        pow.style.left = e.clientX + "px";
        pow.style.top = e.clientY + "px";
        pow.style.setProperty("--giro", (Math.random() * 24 - 12).toFixed(1) + "deg");
        pow.addEventListener("animationend", () => pow.remove());
        document.body.appendChild(pow);
    }, { passive: true });

    /* ---------- Linhas de velocidade quando rola rápido ----------
       A camada só existe enquanto a página está voando: some e sai do DOM logo depois que para.
       Três efeitos pra descer (branco, "mergulhando" na leitura) e três pra subir (dourado, tipo
       flashback/voltando) — escolhidos à sorte a cada arrancada, sem repetir o mesmo direto. */
    function radial(cor) {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="${cor}">`;
        const n = 64;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + (Math.random() - .5) * .06;
            const largura = .006 + Math.random() * .016;
            const dentro = 68 + Math.random() * 28;
            const ponto = (r, ang) => (100 + Math.cos(ang) * r).toFixed(1) + "," + (100 + Math.sin(ang) * r).toFixed(1);
            svg += `<polygon opacity="${(.35 + Math.random() * .5).toFixed(2)}" points="${ponto(dentro, a)} ${ponto(150, a - largura)} ${ponto(150, a + largura)}"/>`;
        }
        return svg + "</g></svg>";
    }
    function paralelas(cor, desce) {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none"><g stroke="${cor}" stroke-linecap="round">`;
        const n = 46;
        for (let i = 0; i < n; i++) {
            const x = Math.random() * 200;
            const desvio = (Math.random() - .5) * 16;
            const comprimento = 70 + Math.random() * 110;
            const y1 = desce ? -20 : 220;
            const y2 = desce ? y1 + comprimento : y1 - comprimento;
            svg += `<line x1="${x.toFixed(1)}" y1="${y1}" x2="${(x + desvio).toFixed(1)}" y2="${y2}" stroke-width="${(.4 + Math.random() * 1.2).toFixed(2)}" opacity="${(.3 + Math.random() * .5).toFixed(2)}"/>`;
        }
        return svg + "</g></svg>";
    }
    function trama(cor) {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="${cor}">`;
        const n = 110;
        for (let i = 0; i < n; i++) {
            svg += `<circle cx="${(Math.random() * 200).toFixed(1)}" cy="${(Math.random() * 200).toFixed(1)}" r="${(.6 + Math.random() * 2.1).toFixed(2)}" opacity="${(.22 + Math.random() * .48).toFixed(2)}"/>`;
        }
        return svg + "</g></svg>";
    }
    const imagem = (svg) => "data:image/svg+xml," + encodeURIComponent(svg);
    const EFEITOS = {
        desce: [
            { classe: "v-radial", gerar: () => imagem(radial("#ffffff")) },
            { classe: "v-paralelas", gerar: () => imagem(paralelas("#ffffff", true)) },
            { classe: "v-trama", gerar: () => imagem(trama("#ffffff")) },
        ],
        sobe: [
            { classe: "v-radial v-sobe", gerar: () => imagem(radial("#ffe14d")) },
            { classe: "v-paralelas v-sobe", gerar: () => imagem(paralelas("#ffe14d", false)) },
            { classe: "v-flash", gerar: null },
        ],
    };
    let camada = null, ultimoY = scrollY, ultimoT = performance.now(), quadro = 0, parar = 0, ultimoEfeito = "";
    function apagar() {
        if (!camada) return;
        const saindo = camada;
        camada = null;
        saindo.style.opacity = "0";
        setTimeout(() => saindo.remove(), 350);
    }
    function medir() {
        quadro = 0;
        const agora = performance.now(), y = scrollY, desce = y > ultimoY;
        const velocidade = Math.abs(y - ultimoY) / Math.max(16, agora - ultimoT); // px por ms
        ultimoY = y; ultimoT = agora;
        const forca = Math.min(1, Math.max(0, (velocidade - 2.6) / 5));
        if (forca < .05) return;
        if (!camada) {
            const lista = EFEITOS[desce ? "desce" : "sobe"];
            let opcoes = lista.filter((e) => e.classe !== ultimoEfeito);
            const efeito = opcoes[Math.floor(Math.random() * opcoes.length)];
            ultimoEfeito = efeito.classe;
            camada = document.createElement("div");
            camada.className = "gibi-velocidade " + efeito.classe;
            camada.setAttribute("aria-hidden", "true");
            if (efeito.gerar) camada.style.backgroundImage = `url("${efeito.gerar()}")`;
            document.body.appendChild(camada);
            void camada.offsetWidth;
        }
        camada.style.opacity = (.25 + forca * .45).toFixed(2);
        clearTimeout(parar);
        parar = setTimeout(apagar, 140);
    }
    addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(medir); }, { passive: true });
})();
