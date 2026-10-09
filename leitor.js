/* Modo leitor: transforma as seções do site em "páginas" de gibi, uma por vez, navegáveis com
   seta, clique ou deslize, com animação (e som) de virar página, índice com miniaturas e retomando
   de onde parou. Arquivo separado de propósito: se algo falhar aqui, o resto do site segue igual. */
(function () {
    "use strict";
    const botao = document.getElementById("botaoLeitor");
    if (!botao) return;
    const raiz = document.documentElement;
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tr = (t) => (window.traduzir ? window.traduzir(t) : t);
    const CHAVE = "portfolio-leitor-pagina";

    const SELETORES = ["#inicio", "#sobre-mim", "#projetos", "#mais-projetos", "#servicos", "#orcamento", "#contato", ".gibi-fim", ".contracapa"];
    const TITULOS = ["Capa", "Sobre mim", "Projetos", "Mais projetos", "Serviços", "Orçamento", "Contato", "Fim?", "Contracapa"];
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
            <div class="leitor-barra-meio">
                <button type="button" class="leitor-indice-botao" aria-label="${tr("Índice")}" aria-haspopup="true" aria-expanded="false">☰ ${tr("Índice")}</button>
                <span class="leitor-contagem" aria-live="polite"></span>
            </div>
            <div class="leitor-navegacao">
                <button type="button" class="leitor-anterior" aria-label="${tr("Página anterior")}">←</button>
                <button type="button" class="leitor-proxima" aria-label="${tr("Próxima página")}">→</button>
            </div>
        </div>
        <div class="leitor-indice" id="leitorIndice" hidden>
            <p class="leitor-indice-titulo">${tr("Índice")}</p>
            <div class="leitor-indice-grade"></div>
        </div>
        <div class="leitor-virada" aria-hidden="true"></div>`;
    document.body.appendChild(moldura);
    const contagem = moldura.querySelector(".leitor-contagem");
    const btnAnterior = moldura.querySelector(".leitor-anterior");
    const btnProxima = moldura.querySelector(".leitor-proxima");
    const virada = moldura.querySelector(".leitor-virada");
    const btnIndice = moldura.querySelector(".leitor-indice-botao");
    const painelIndice = moldura.querySelector("#leitorIndice");
    const grade = moldura.querySelector(".leitor-indice-grade");

    paginas.forEach((_, i) => {
        const miniatura = document.createElement("button");
        miniatura.type = "button";
        miniatura.className = "leitor-miniatura";
        miniatura.innerHTML = `<b>${i + 1}</b><span>${tr(TITULOS[i] || "")}</span>`;
        miniatura.addEventListener("click", () => { fecharIndice(); irPara(i); });
        grade.appendChild(miniatura);
    });

    function abrirIndice() {
        painelIndice.hidden = false;
        btnIndice.setAttribute("aria-expanded", "true");
        grade.querySelectorAll(".leitor-miniatura").forEach((m, i) => m.classList.toggle("is-atual", i === indice));
    }
    function fecharIndice() {
        painelIndice.hidden = true;
        btnIndice.setAttribute("aria-expanded", "false");
    }
    btnIndice.addEventListener("click", () => (painelIndice.hidden ? abrirIndice() : fecharIndice()));

    function salvarPagina() {
        try { localStorage.setItem(CHAVE, String(indice)); } catch (e) { /* sem armazenamento: só não lembra */ }
    }

    function atualizarContagem() {
        contagem.textContent = `${indice + 1} / ${paginas.length}`;
        btnAnterior.disabled = indice === 0;
        btnProxima.disabled = indice === paginas.length - 1;
    }

    function irPara(novoIndice) {
        novoIndice = Math.max(0, Math.min(paginas.length - 1, novoIndice));
        if (novoIndice === indice) return;
        if (window.musicaSite) window.musicaSite.pagina();
        const trocar = () => {
            paginas[indice].classList.remove("leitor-ativa");
            indice = novoIndice;
            const atual = paginas[indice];
            atual.classList.add("leitor-ativa");
            atual.scrollTop = 0;
            atualizarContagem();
            salvarPagina();
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
        let partida = 0;
        try {
            const salva = Number(localStorage.getItem(CHAVE));
            if (Number.isInteger(salva) && salva > 0 && salva < paginas.length) partida = salva;
        } catch (e) { /* sem armazenamento: começa da capa */ }
        indice = partida;
        paginas.forEach((p, i) => p.classList.toggle("leitor-ativa", i === partida));
        atualizarContagem();
        raiz.classList.add("modo-leitor");
        moldura.hidden = false;
        btnProxima.focus();
        if (partida > 0 && typeof mostrarToast === "function") {
            mostrarToast(`📖 ${tr("Continuando da página")} ${partida + 1}`);
        }
    }
    function fechar() {
        if (!aberto) return;
        aberto = false;
        fecharIndice();
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
        if (e.key === "Escape") { if (!painelIndice.hidden) fecharIndice(); else fechar(); return; }
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
