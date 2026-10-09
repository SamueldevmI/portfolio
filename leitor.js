/* Modo leitor: transforma as seções do site em "páginas" de gibi, uma por vez, navegáveis com
   seta, clique ou deslize, com animação de virar página. Arquivo separado de propósito: se algo
   falhar aqui, o resto do site segue igual. */
(function () {
    "use strict";
    const botao = document.getElementById("botaoLeitor");
    if (!botao) return;
    const raiz = document.documentElement;
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tr = (t) => (window.traduzir ? window.traduzir(t) : t);

    const SELETORES = ["#inicio", "#sobre-mim", "#projetos", "#mais-projetos", "#servicos", "#orcamento", "#contato", ".gibi-fim", ".contracapa"];
    const paginas = SELETORES.map((s) => document.querySelector(s)).filter(Boolean);
    if (paginas.length < 2) return;
    paginas.forEach((p) => p.classList.add("leitor-pagina"));

    let indice = 0;
    let aberto = false;
    let focoAntes = null;

    const moldura = document.createElement("div");
    moldura.className = "leitor-moldura";
    moldura.hidden = true;
    moldura.innerHTML = `
        <div class="leitor-barra">
            <button type="button" class="leitor-fechar" aria-label="${tr("Sair do modo leitor")}">✕ ${tr("Sair")}</button>
            <span class="leitor-contagem" aria-live="polite"></span>
            <div class="leitor-navegacao">
                <button type="button" class="leitor-anterior" aria-label="${tr("Página anterior")}">←</button>
                <button type="button" class="leitor-proxima" aria-label="${tr("Próxima página")}">→</button>
            </div>
        </div>
        <div class="leitor-virada" aria-hidden="true"></div>`;
    document.body.appendChild(moldura);
    const contagem = moldura.querySelector(".leitor-contagem");
    const btnAnterior = moldura.querySelector(".leitor-anterior");
    const btnProxima = moldura.querySelector(".leitor-proxima");
    const virada = moldura.querySelector(".leitor-virada");

    function atualizarContagem() {
        contagem.textContent = `${indice + 1} / ${paginas.length}`;
        btnAnterior.disabled = indice === 0;
        btnProxima.disabled = indice === paginas.length - 1;
    }

    function irPara(novoIndice) {
        novoIndice = Math.max(0, Math.min(paginas.length - 1, novoIndice));
        if (novoIndice === indice) return;
        const trocar = () => {
            paginas[indice].classList.remove("leitor-ativa");
            indice = novoIndice;
            const atual = paginas[indice];
            atual.classList.add("leitor-ativa");
            atual.scrollTop = 0;
            atualizarContagem();
        };
        if (semMovimento) { trocar(); return; }
        virada.classList.remove("virando"); void virada.offsetWidth; virada.classList.add("virando");
        setTimeout(trocar, 210);
        setTimeout(() => virada.classList.remove("virando"), 520);
    }

    function abrir() {
        if (aberto) return;
        aberto = true;
        focoAntes = document.activeElement;
        indice = 0;
        paginas.forEach((p, i) => p.classList.toggle("leitor-ativa", i === 0));
        atualizarContagem();
        raiz.classList.add("modo-leitor");
        moldura.hidden = false;
        btnProxima.focus();
    }
    function fechar() {
        if (!aberto) return;
        aberto = false;
        raiz.classList.remove("modo-leitor");
        moldura.hidden = true;
        paginas.forEach((p) => p.classList.remove("leitor-ativa"));
        const alvo = document.getElementById(SELETORES[indice].replace(/^[#.]/, "")) || paginas[indice];
        if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ behavior: semMovimento ? "instant" : "smooth", block: "start" });
        if (focoAntes) focoAntes.focus();
    }

    botao.addEventListener("click", abrir);
    moldura.querySelector(".leitor-fechar").addEventListener("click", fechar);
    btnAnterior.addEventListener("click", () => irPara(indice - 1));
    btnProxima.addEventListener("click", () => irPara(indice + 1));

    document.addEventListener("keydown", (e) => {
        if (!aberto) return;
        if (e.key === "Escape") { fechar(); return; }
        const alvo = e.target;
        if (alvo?.matches?.("input, textarea, [contenteditable]")) return;
        if (e.key === "ArrowRight") irPara(indice + 1);
        else if (e.key === "ArrowLeft") irPara(indice - 1);
    });

    // deslizar no celular: só conta como "virar página" se o gesto for bem horizontal e largo,
    // pra não brigar com listas que já arrastam na horizontal (carrossel de projetos, serviços...)
    let tx = 0, ty = 0;
    moldura.addEventListener("touchstart", (e) => {
        if (!aberto || !e.touches[0]) return;
        tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    moldura.addEventListener("touchend", (e) => {
        if (!aberto || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) irPara(indice - Math.sign(dx));
    }, { passive: true });
})();
