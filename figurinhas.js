/* Álbum de figurinhas: conforme a pessoa explora o site, vai ganhando figurinhas colecionáveis
   (tipo revista de banca antiga). Fica guardado só neste aparelho. Arquivo separado de propósito:
   não depende do resto do site pra nada essencial, e se algo falhar aqui o resto segue igual. */
(function () {
    "use strict";
    const botao = document.getElementById("botaoFigurinhas");
    if (!botao) return;

    const CHAVE = "portfolio-figurinhas";
    const CHAVE_VISITA = "portfolio-figurinhas-visita";

    const FIGURINHAS = [
        { id: "boas-vindas", emoji: "👋", titulo: "Bem-vindo!", desc: "Abriu a revista." },
        { id: "sobre-mim", emoji: "🧑‍💻", titulo: "Quem é esse?", desc: "Chegou em Sobre mim." },
        { id: "projetos", emoji: "🧪", titulo: "Testou de verdade", desc: "Abriu a demonstração de um projeto." },
        { id: "servicos", emoji: "🛠️", titulo: "Olhou os serviços", desc: "Chegou até os Serviços." },
        { id: "roupa-nova", emoji: "🎨", titulo: "Roupa nova", desc: "Trocou o tema do site." },
        { id: "classico", emoji: "📺", titulo: "Modo clássico", desc: "Ligou o preto e branco." },
        { id: "rara", emoji: "💎", titulo: "Edição rara", desc: "Achou o segredo escondido no site." },
        { id: "zap", emoji: "💬", titulo: "Chamou no zap", desc: "Clicou pra chamar no WhatsApp." },
        { id: "fim", emoji: "🏁", titulo: "Até o fim", desc: "Leu a revista inteira." },
        { id: "atendente", emoji: "⚡", titulo: "Atendente nota 10", desc: "Fez 25 ou mais no Atende aí!" },
        { id: "fiel", emoji: "🔁", titulo: "Leitor fiel", desc: "Voltou outro dia pra ver mais." },
    ];

    function ler() {
        try { return new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]")); } catch (e) { return new Set(); }
    }
    function salvar(conjunto) {
        try { localStorage.setItem(CHAVE, JSON.stringify([...conjunto])); } catch (e) { /* sem armazenamento: vale só nesta visita */ }
    }

    const conquistadas = ler();
    let grade = null; // só existe depois que o álbum abre a primeira vez

    function atualizarContador() {
        const n = conquistadas.size;
        botao.querySelector(".fig-contagem").textContent = n > 0 ? String(n) : "";
        botao.setAttribute("aria-label", `Álbum de figurinhas: ${n} de ${FIGURINHAS.length} encontradas`);
        const progresso = document.getElementById("figProgresso");
        if (progresso) progresso.textContent = `${n}/${FIGURINHAS.length}`;
    }

    function montarItem(fig) {
        const achou = conquistadas.has(fig.id);
        const item = document.createElement("div");
        item.className = "fig-item" + (achou ? " is-achada" : "");
        item.style.setProperty("--giro", (Math.random() * 6 - 3).toFixed(1) + "deg");
        item.innerHTML = achou
            ? `<span class="fig-emoji">${fig.emoji}</span><b>${fig.titulo}</b><small>${fig.desc}</small>`
            : `<span class="fig-emoji">❔</span><b>???</b><small>Continue explorando…</small>`;
        return item;
    }

    function montarGrade() {
        if (!grade) return;
        grade.textContent = "";
        FIGURINHAS.forEach((fig) => grade.appendChild(montarItem(fig)));
    }

    function desbloquear(id) {
        if (conquistadas.has(id)) return;
        const fig = FIGURINHAS.find((f) => f.id === id);
        if (!fig) return;
        conquistadas.add(id);
        salvar(conquistadas);
        atualizarContador();
        montarGrade();
        if (typeof mostrarToast === "function") {
            mostrarToast(conquistadas.size === FIGURINHAS.length ? "🏆 Álbum completo! Você explorou tudo." : `🎟️ Nova figurinha: ${fig.emoji} ${fig.titulo}`);
        }
    }

    /* ---------- O painel do álbum, criado só quando precisa ---------- */
    let overlay = null;
    let focoAntes = null;
    function abrir() {
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "fig-overlay";
            overlay.id = "figOverlay";
            overlay.hidden = true;
            overlay.innerHTML = `<div class="fig-caixa" role="dialog" aria-modal="true" aria-labelledby="figTitulo">
                <button type="button" class="fig-fechar" aria-label="Fechar álbum">✕</button>
                <p class="fig-eyebrow">ÁLBUM DE FIGURINHAS</p>
                <h3 id="figTitulo">Sua coleção <span id="figProgresso">0/${FIGURINHAS.length}</span></h3>
                <p class="fig-ajuda">Vá explorando o site: cada canto pode ter uma figurinha escondida.</p>
                <div class="fig-grade" id="figGrade"></div>
            </div>`;
            document.body.append(overlay);
            grade = overlay.querySelector("#figGrade");
            overlay.querySelector(".fig-fechar").addEventListener("click", fechar);
            overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(); });
            atualizarContador();
            montarGrade();
        }
        focoAntes = document.activeElement;
        overlay.hidden = false;
        overlay.querySelector(".fig-fechar").focus();
    }
    function fechar() {
        if (!overlay) return;
        overlay.hidden = true;
        if (focoAntes) focoAntes.focus();
    }
    botao.addEventListener("click", () => (overlay && !overlay.hidden ? fechar() : abrir()));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay && !overlay.hidden) fechar();
    });

    atualizarContador();

    /* ---------- Gatilhos: cada um desbloqueia uma figurinha ao ser notado ---------- */

    setTimeout(() => desbloquear("boas-vindas"), 1200);

    if ("IntersectionObserver" in window) {
        const marcos = [
            ["sobre-mim", document.getElementById("sobre-mim")],
            ["servicos", document.getElementById("servicos")],
            ["fim", document.querySelector(".gibi-fim") || document.querySelector(".contracapa")],
        ];
        marcos.forEach(([id, alvo]) => {
            if (!alvo) return;
            const obs = new IntersectionObserver((entradas) => {
                if (entradas.some((e) => e.isIntersecting)) { desbloquear(id); obs.disconnect(); }
            }, { threshold: 0.35 });
            obs.observe(alvo);
        });
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest(".card-projeto [data-demo], .link-projeto, .mini-projeto")) desbloquear("projetos");
        if (e.target.closest('a[href*="wa.me"]')) desbloquear("zap");
    });

    document.addEventListener("temaTrocado", () => desbloquear("roupa-nova"));

    // mini-jogo: vale o recorde já guardado (o jogo pode ter rodado antes do álbum carregar) e cada partida nova
    const ATENDENTE = 25;
    try { if (Number(localStorage.getItem("jogo-atende-recorde")) >= ATENDENTE) desbloquear("atendente"); } catch (e) { /* sem armazenamento */ }
    document.addEventListener("jogoAtendeFim", (e) => { if (e.detail && e.detail.atendidos >= ATENDENTE) desbloquear("atendente"); });

    new MutationObserver(() => {
        const raiz = document.documentElement;
        if (raiz.classList.contains("gibi-pb")) desbloquear("classico");
        if (raiz.classList.contains("edicao-rara")) desbloquear("rara");
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    try {
        const hoje = new Date().toISOString().slice(0, 10);
        const ultima = localStorage.getItem(CHAVE_VISITA);
        if (ultima && ultima !== hoje) desbloquear("fiel");
        localStorage.setItem(CHAVE_VISITA, hoje);
    } catch (e) { /* sem armazenamento: essa figurinha não aparece, sem problema */ }
})();
