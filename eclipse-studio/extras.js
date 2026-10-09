"use strict";
/* Extras da Eclipse Studio: Halloween em outubro, contador de visitas e "instalar como app". */

/* ========== Halloween: o mês inteiro de outubro, e some sozinho em 1º de novembro ==========
   Prévia fora de outubro: ?festa=halloween   ·   desligar: ?festa=nao */
const HALLOWEEN = (() => {
    const pedido = new URLSearchParams(location.search).get("festa");
    const hoje = new Date();
    const ativo = pedido === "halloween" || (pedido !== "nao" && hoje.getMonth() === 9);
    if (!ativo) return { ativo };
    document.documentElement.classList.add("halloween");

    /* faixa com contagem até o dia 31 */
    const dia31 = new Date(hoje.getFullYear(), 9, 31);
    const faltam = Math.round((dia31 - new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) / 864e5);
    const texto = faltam === 0 ? "🎃 Hoje é Halloween! Noite das bruxas na Eclipse ✦"
        : faltam > 0 && faltam <= 31 ? `🎃 Mês das bruxas na Eclipse · ${faltam === 1 ? "amanhã é Halloween" : `faltam ${faltam} dias pro Halloween`} ✦`
        : "🎃 Mês das bruxas na Eclipse ✦";
    document.body.insertAdjacentHTML("afterbegin", `<p class="aviso-halloween">${texto}</p>`);

    /* abóboras com vela no topo, ao lado das velas */
    const abobora = (classe) => `<svg class="abobora ${classe}" viewBox="0 0 100 90" aria-hidden="true">
        <path class="ab-cabo" d="M48 18C46 8 52 2 58 4C54 8 53 13 54 18Z"/>
        <ellipse class="ab-gomo" cx="30" cy="52" rx="24" ry="32"/><ellipse class="ab-gomo" cx="70" cy="52" rx="24" ry="32"/><ellipse class="ab-meio" cx="50" cy="52" rx="24" ry="34"/>
        <path class="ab-rosto" d="M34 44l8 -8l6 10zM66 44l-8 -8l-6 10zM32 62q18 14 36 0l-5 4l-4 -4l-5 5l-4 -5l-5 5l-4 -4z"/>
    </svg>`;
    const arteTopo = document.querySelector(".hero-arte");
    if (arteTopo) arteTopo.insertAdjacentHTML("beforeend", abobora("abobora-e") + abobora("abobora-d"));

    /* um morcego atravessa a tela de vez em quando */
    const semMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!semMov) {
        const voar = () => {
            if (!document.hidden && !document.querySelector("dialog[open]")) {
                const m = document.createElement("i");
                m.className = "morcego-voa";
                m.style.setProperty("--alto", `${8 + Math.random() * 50}vh`);
                m.style.setProperty("--dur", `${5 + Math.random() * 3}s`);
                m.innerHTML = '<svg viewBox="-30 -16 60 30" aria-hidden="true"><path d="M0 -4L-4 -12L-6 -3C-12 -9 -22 -8 -26 -2C-21 -2 -19 1 -19 5C-15 2 -11 3 -9 7C-6 3 -3 4 0 8C3 4 6 3 9 7C11 3 15 2 19 5C19 1 21 -2 26 -2C22 -8 12 -9 6 -3L4 -12Z"/></svg>';
                m.addEventListener("animationend", () => m.remove());
                document.body.appendChild(m);
            }
            setTimeout(voar, 9000 + Math.random() * 9000);
        };
        setTimeout(voar, 4000);
    }

    /* look de Halloween em primeiro nos looks prontos */
    const itens = [{ id: "capa", tam: "" }, { id: "colarBola", tam: "" }, { id: "brincoMorcego", tam: "" }];
    if (typeof LOOKS !== "undefined" && itens.every((i) => produto(i.id) && disponivel(produto(i.id))) && !LOOKS.some((l) => l.id === "halloween")) {
        LOOKS.unshift({ id: "halloween", nome: "Look Noite de Halloween 🎃", desc: "Capa de veludo, bola de cristal e morceguinhos: fantasia que dá pra usar o ano todo.", itens });
        renderLooks();
    }
    return { ativo, faltam };
})();

/* ========== Contador de visitas (desligado até ter a conta: ver contador.js) ========== */
(function contarVisitas() {
    const c = window.CONTADOR_ECLIPSE;
    if (!c || !c.ligado) return;
    c.contar("/eclipse/", "Eclipse Studio · visita");
    const de = new URLSearchParams(location.search).get("de");
    if (de && ORIGENS_LOJA[de.toLowerCase()]) c.contar(`/eclipse/origem/${de.toLowerCase()}`, `Chegou por: ${ORIGENS_LOJA[de.toLowerCase()]}`);
    document.addEventListener("click", (e) => {
        const peca = e.target.closest("[data-abrir]");
        if (peca) c.contar(`/eclipse/peca/${peca.dataset.abrir}`, `Peça aberta: ${produto(peca.dataset.abrir)?.nome || peca.dataset.abrir}`);
        if (e.target.closest("#enviarZap")) {
            c.contar("/eclipse/pedido", "Pedido enviado no WhatsApp");
            if (origemChave()) c.contar(`/eclipse/pedido/${origemChave()}`, `Pedido de quem chegou por: ${origemDaCliente()}`);
        }
    }, true);
    document.addEventListener("sacola:caiu", (e) => e.detail.ids.forEach((id) => c.contar(`/eclipse/sacola/${id}`, `Na sacola: ${produto(id)?.nome || id}`)));
})();

/* ========== Instalar como app ========== */
(function instalar() {
    const rodape = document.querySelector(".rodape-grade > div");
    if (!rodape) return;
    const jaEhApp = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (jaEhApp) return;
    rodape.insertAdjacentHTML("beforeend", '<p class="instalar-app"><button type="button" class="botao botao-linha" id="instalarApp" hidden>📲 Instalar o app da Eclipse</button><small id="instalarIphone" hidden>No iPhone: toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b> 📲</small></p>');
    const botao = document.getElementById("instalarApp");
    let pedido = null;
    addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        pedido = e;
        botao.hidden = false;
    });
    botao.addEventListener("click", async () => {
        if (!pedido) return;
        pedido.prompt();
        const { outcome } = await pedido.userChoice;
        if (outcome === "accepted") { botao.hidden = true; avisar("✦ Pronto! A Eclipse está na sua tela inicial."); }
        pedido = null;
    });
    addEventListener("appinstalled", () => { botao.hidden = true; });
    const iphone = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (iphone) document.getElementById("instalarIphone").hidden = false;
})();

/* ========== Drop com data (LOJA.drop no script.js) ==========
   Sem data: não aparece nada. Com data: faixa com contagem regressiva e "me avisa" até a hora marcada
   (as peças do drop ficam escondidas, ver naVitrine); depois, por 7 dias, "o drop chegou!" e elas viram novidade. */
(function dropComData() {
    if (!DROP_DATA || Number.isNaN(DROP_DATA.getTime())) return;
    const nome = `${LOJA.drop.emoji || "✦"} ${t(LOJA.drop.nome)}`;
    const SETE_DIAS = 7 * 864e5;
    function marcarNovas() {
        if (dropFechado()) return;
        let mudou = false;
        PRODUTOS.forEach((p) => { if (p.drop && !p.novo) { p.novo = true; mudou = true; } });
        if (mudou && typeof renderGrade === "function") { renderChips(); renderGrade(); }
    }
    marcarNovas();
    document.addEventListener("catalogo:atualizado", marcarNovas);
    if (!dropFechado() && Date.now() - DROP_DATA.getTime() > SETE_DIAS) return;

    const faixa = document.createElement("p");
    faixa.className = "aviso-drop";
    faixa.setAttribute("role", "status");
    const halloween = document.querySelector(".aviso-halloween");
    if (halloween) halloween.after(faixa); else document.body.prepend(faixa);
    function contagem() {
        const ms = DROP_DATA.getTime() - Date.now();
        const min = Math.max(0, Math.floor(ms / 6e4)), d = Math.floor(min / 1440), h = Math.floor(min / 60) % 24, m = min % 60;
        return d ? `${d} ${d === 1 ? t("dia") : t("dias")} ${t("e")} ${h} h` : h ? `${h} h ${t("e")} ${m} min` : `${m} min`;
    }
    function desenhar() {
        if (dropFechado()) {
            faixa.innerHTML = `${nome} ${t("abre em")} <b>${contagem()}</b> · <a href="${linkWhats(`Oi! Quero ser avisada quando o ${LOJA.drop.nome} abrir 🖤`)}" target="_blank" rel="noopener noreferrer">${t("Me avisa")}</a>`;
        } else {
            faixa.innerHTML = `${nome}: ${t("chegou!")} <a href="#novidades" data-ver-drop>${t("Ver as peças")}</a>`;
            marcarNovas();
        }
    }
    faixa.addEventListener("click", (e) => {
        if (!e.target.closest("[data-ver-drop]")) return;
        e.preventDefault();
        filtro.cat = "novidades";
        renderChips(); renderGrade();
        document.getElementById("colecao")?.scrollIntoView({ block: "start" });
    });
    desenhar();
    setInterval(() => { if (!document.hidden) desenhar(); }, 30000);
    document.addEventListener("idiomaMudou", desenhar);
})();
