/* Antes × depois do topo: o mesmo cliente mandando mensagem pro seu negócio, sem site (ninguém responde,
   ele desiste) e com site (resposta na hora, pedido fechado). Uma alça divide os dois lados: arrasta com o
   dedo ou o mouse, ou deixa ela passear sozinha. Trocar o ramo no seletor muda a cena (e também a calculadora
   e a prévia, que continuam no script.js, por baixo, nos botões de ramo escondidos).
   Só transform pra mexer a alça; a chuva e o passeio param quando o quadro sai da tela. */
(function () {
    "use strict";
    const raiz = document.getElementById("comparador");
    const quadro = raiz && raiz.querySelector(".ad");
    if (!quadro) return;
    const seletor = raiz.querySelector(".ad-ramo select");
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CENAS = {
        pizzaria: { hora: "23:47", msg: "Boa noite! Vocês tão abertos? Queria 2 calabresa 🍕", insiste: "???", desiste: "deixa, pedi em outro lugar 👋", viu: "07:30",
            resposta: "Abertos até 23h30! 🍕 2 calabresa = R$ 90. Chega em 40 min.", fecha: "Fechado! 🙌", ganho: "+1 PEDIDO", valor: "R$ 90" },
        barbearia: { hora: "06:58", msg: "Fala! Tem horário hoje à tarde? Corte + barba", insiste: "??", desiste: "achei outra barbearia, valeu", viu: "12:40",
            resposta: "Tem sim ✂️ 16h30 ou 18h. Toca no horário pra agendar 👇", fecha: "18h! 🙌", ganho: "+1 HORÁRIO", valor: "R$ 55" },
        "loja de roupa": { hora: "22:10", msg: "Oi! Tem o moletom preto no M?", insiste: "oi??", desiste: "comprei em outra loja 👋", viu: "09:15",
            resposta: "Tem! 🖤 Moletom M = R$ 189. Pix ou cartão?", fecha: "Pix! 🙌", ganho: "+1 VENDA", valor: "R$ 189" },
        "salão": { hora: "21:35", msg: "Oi, tem horário pra escova no sábado?", insiste: "alguém?", desiste: "marquei em outro salão 👋", viu: "08:50",
            resposta: "Tem! 💇‍♀️ Sábado 10h ou 14h. Qual prefere?", fecha: "10h! 🙌", ganho: "+1 AGENDAMENTO", valor: "R$ 50" },
        academia: { hora: "05:40", msg: "Bom dia! Como faço pra treinar aí?", insiste: "??", desiste: "fechei com outra academia", viu: "11:20",
            resposta: "Bora! 💪 Aula experimental grátis hoje às 18h. Te espero!", fecha: "Tô dentro! 🙌", ganho: "+1 ALUNO", valor: "R$ 99/mês" },
        "clínica": { hora: "20:15", msg: "Boa noite, tem consulta com clínico essa semana?", insiste: "olá?", desiste: "consegui em outra clínica", viu: "10:05",
            resposta: "Temos! 🩺 Quinta 9h ou 14h. Qual fica melhor?", fecha: "Quinta 9h, obrigada!", ganho: "+1 CONSULTA", valor: "marcada" },
    };
    const tr = (texto) => (window.traduzir ? window.traduzir(texto) : texto); // em espanhol, a cena inteira troca
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const mais = (hora, min) => { const [h, m] = hora.split(":").map(Number); const t = (h * 60 + m + min) % 1440; return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
    const bolha = (quem, texto, hora, extra = "") => `<p class="ad-bolha ad-${quem}">${esc(tr(texto))}<small>${extra}${hora}</small></p>`;

    function cena(lado, c) {
        const sem = lado === "sem";
        const conversa = sem
            ? bolha("cliente", c.msg, c.hora) + bolha("cliente", c.insiste, mais(c.hora, 11)) + bolha("cliente", c.desiste, mais(c.hora, 23)) + `<p class="ad-aviso">${tr("você viu às")} ${c.viu} 😴</p>`
            : bolha("cliente", c.msg, c.hora) + bolha("voce", c.resposta, c.hora, `⚡ ${tr("resposta automática")} · `) + bolha("cliente", c.fecha, mais(c.hora, 1));
        return `
            <span class="ad-rotulo">${tr(sem ? "😩 sem site" : "😎 com site")}</span>
            ${sem ? '<i class="ad-chuva" aria-hidden="true"></i>' : '<i class="ad-raios" aria-hidden="true"></i>'}
            <div class="ad-celular">
                <div class="ad-zap-topo"><span class="ad-avatar" aria-hidden="true">👤</span><p><b>${tr("Cliente novo")}</b><small>${sem ? tr("visto por último às") + " " + c.viu : "online"}</small></p></div>
                <div class="ad-conversa">${conversa}</div>
            </div>
            <p class="ad-carimbo">${sem ? `${tr("Cliente perdido")}<small>${tr("foi pro concorrente")}</small>` : `${esc(tr(c.ganho))}<small>${esc(tr(c.valor))}</small>`}</p>`;
    }

    quadro.innerHTML = `
        <div class="ad-cena ad-sem"></div>
        <div class="ad-janela"><div class="ad-cena ad-com"></div></div>
        <div class="ad-alca" role="slider" tabindex="0" aria-label="Arraste pra comparar: à esquerda sem site, à direita com site" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><span aria-hidden="true">⇆</span></div>
        <p class="ad-dica" aria-hidden="true">arrasta ↔</p>`; // estes dois o idioma.js traduz (ficam fixos)
    const camadaSem = quadro.querySelector(".ad-sem"), camadaCom = quadro.querySelector(".ad-com");
    const janela = quadro.querySelector(".ad-janela"), alca = quadro.querySelector(".ad-alca");

    function mostrarRamo(ramo) {
        const c = CENAS[ramo] || CENAS.pizzaria;
        camadaSem.innerHTML = cena("sem", c);
        camadaCom.innerHTML = cena("com", c);
    }

    /* posição da alça: 0 = tudo "com site", 1 = tudo "sem site" (o lado sem fica à esquerda da alça) */
    let pos = .5, largura = quadro.clientWidth;
    function aplicar() {
        const x = Math.round(pos * largura);
        janela.style.transform = `translateX(${x}px)`;
        camadaCom.style.transform = `translateX(${-x}px)`;
        alca.style.transform = `translateX(${x}px)`;
        alca.setAttribute("aria-valuenow", String(Math.round(pos * 100)));
        quadro.classList.toggle("ad-so-sem", pos > .92);
        quadro.classList.toggle("ad-so-com", pos < .08);
    }
    addEventListener("resize", () => { largura = quadro.clientWidth; aplicar(); });

    /* passeio sozinho: mostra os dois lados inteiros, um depois do outro, enquanto ninguém mexe */
    let tocou = false, naTela = false, animacao = 0;
    const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
    function deslizar(para, ms) {
        return new Promise((ok) => {
            const de = pos, t0 = performance.now();
            cancelAnimationFrame(animacao);
            (function passo(agora) {
                if (tocou) return ok();
                const k = Math.min(1, (agora - t0) / ms), suave = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
                pos = de + (para - de) * suave; aplicar();
                if (k < 1) animacao = requestAnimationFrame(passo); else ok();
            })(t0);
        });
    }
    async function passear() {
        while (!tocou) {
            if (!naTela || document.hidden) { await esperar(500); continue; }
            await esperar(1300); if (tocou) return;
            await deslizar(.97, 900); await esperar(2600); if (tocou) return;
            await deslizar(.03, 1300); await esperar(3400); if (tocou) return;
            await deslizar(.5, 900); await esperar(1200);
        }
    }

    /* arrastar (dedo ou mouse); na vertical o dedo continua rolando a página */
    function pelaPosicao(clientX) {
        const r = quadro.getBoundingClientRect();
        pos = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
        aplicar();
    }
    function parar() { tocou = true; cancelAnimationFrame(animacao); quadro.classList.add("ad-mexeu"); }
    quadro.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        parar();
        quadro.setPointerCapture(e.pointerId);
        quadro.classList.add("ad-arrastando");
        pelaPosicao(e.clientX);
    });
    quadro.addEventListener("pointermove", (e) => { if (quadro.hasPointerCapture(e.pointerId)) pelaPosicao(e.clientX); });
    const soltar = () => quadro.classList.remove("ad-arrastando");
    quadro.addEventListener("pointerup", soltar);
    quadro.addEventListener("pointercancel", soltar);
    alca.addEventListener("keydown", (e) => {
        const passo = { ArrowLeft: -.05, ArrowRight: .05, Home: -1, End: 1 }[e.key];
        if (passo === undefined) return;
        e.preventDefault(); parar();
        pos = Math.min(1, Math.max(0, pos + passo)); aplicar();
    });

    /* ramo: o seletor aperta o botão de ramo escondido (que já cuida da calculadora e da prévia) */
    const lerRamo = () => { try { return localStorage.getItem("portfolio-tipo-negocio") || ""; } catch (e) { return ""; } };
    const inicial = CENAS[lerRamo()] ? lerRamo() : "pizzaria";
    seletor.value = inicial;
    mostrarRamo(inicial);
    document.addEventListener("idiomaMudou", () => mostrarRamo(seletor.value));
    /* Cor pelo ramo: quem escolhe um ramo vê o site puxar pras cores dele (style.css, html[data-ramo-cor]).
       Só por escolha da pessoa nesta visita; trocar o tema lá em cima volta às cores normais. */
    const COR_DO_RAMO = { pizzaria: "pizzaria", barbearia: "barbearia", "loja de roupa": "loja", "salão": "salao", academia: "academia", "clínica": "clinica" };
    let avisouCor = false;
    function pintarPeloRamo(ramo) {
        const cor = COR_DO_RAMO[ramo];
        if (!cor || document.documentElement.dataset.ramoCor === cor) return;
        document.documentElement.dataset.ramoCor = cor;
        if (!avisouCor && typeof mostrarToast === "function") {
            avisouCor = true;
            mostrarToast(tr("🎨 O site pegou as cores do seu ramo. Pra voltar, é só escolher um tema lá em cima."));
        }
    }
    document.addEventListener("temaTrocado", () => { delete document.documentElement.dataset.ramoCor; });
    document.addEventListener("click", (e) => { const b = e.target.closest(".vitrine-ramos button[data-ramo]"); if (b) pintarPeloRamo(b.dataset.ramo); });
    seletor.addEventListener("change", () => {
        pintarPeloRamo(seletor.value);
        mostrarRamo(seletor.value);
        raiz.querySelector(`.cmp-tipos button[data-tipo="${CSS.escape(seletor.value)}"]`)?.click();
    });

    aplicar();
    if ("IntersectionObserver" in window) {
        new IntersectionObserver((e) => { naTela = e.some((x) => x.isIntersecting); quadro.classList.toggle("ad-na-tela", naTela); }).observe(quadro);
    } else naTela = true;
    if (!semMovimento) passear();
})();
