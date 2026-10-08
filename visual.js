/* Detalhes visuais de gibi (carregado depois que a página abriu, junto com o gibi.js):
   - requadro: a moldura de cada título de seção se risca como caneta nanquim quando ele aparece;
   - você vira personagem: o nome do negócio digitado no topo fala no balão do Contato;
   - retícula que reage ao mouse (só computador): os pontinhos crescem perto do cursor;
   - projetos viram figurinhas: número, raridade e um brilho holográfico;
   - carimbo "APROVADO" no orçamento, na hora de mandar pro WhatsApp.
   Tudo só com transform/opacity, e nada muda o tamanho da página depois que ela abriu. */
(function () {
    "use strict";
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseFino = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tr = (texto) => (window.traduzir ? window.traduzir(texto) : texto);

    /* ---------- Requadro: 4 traços que se desenham em sequência (o gibi.js marca .gibi-visivel) ---------- */
    document.querySelectorAll("main .titulo-secao").forEach((titulo) => {
        if (titulo.querySelector(".requadro")) return;
        const requadro = document.createElement("span");
        requadro.className = "requadro";
        requadro.setAttribute("aria-hidden", "true");
        requadro.innerHTML = "<i></i><i></i><i></i><i></i>";
        titulo.appendChild(requadro);
    });

    /* ---------- Você vira personagem: o balão já existe no HTML (não muda de tamanho), só troca o nome ---------- */
    const personagem = document.querySelector(".contato-personagem .cp-nome");
    if (personagem) {
        const lerNome = () => { try { return (localStorage.getItem("portfolio-nome-negocio") || "").trim().slice(0, 40); } catch (e) { return ""; } };
        const mostrar = (nome) => { personagem.textContent = nome || tr("Você"); personagem.closest(".contato-personagem").classList.toggle("cp-tem-nome", Boolean(nome)); };
        mostrar(lerNome());
        document.addEventListener("input", (e) => {
            if (e.target.matches("#nomeNegocio, .cmp-nome input, .hero-vitrine input")) mostrar(e.target.value.trim().slice(0, 40));
        });
        document.addEventListener("idiomaMudou", () => mostrar(lerNome()));
    }

    /* ---------- Retícula que reage ao mouse: uma lente redonda com pontos maiores segue o cursor.
       A lente anda num sentido e a trama dentro dela no contrário, então os pontos ficam parados
       na página (parecem crescer), e as duas coisas mexem só com transform. ---------- */
    if (mouseFino && !semMovimento) {
        const RAIO = 160;
        // Em cima de algo (texto, botão, card, foto...) a trama fica mais fraca, pra não lavar o
        // que está por baixo; em fundo vazio (só a cor/textura da seção) ela fica na força normal.
        const SELETOR_CONTEUDO = "a, button, input, textarea, select, label, img, svg, canvas, video, iframe, p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, figcaption, strong, b, em, small, span, article, .card-projeto, .botao, .gibi-nota, .gibi-legenda, .gibi-fim, .contracapa, .ficha, .orcamento-caixa, .github-atividade, .fig-item, .fig-overlay, .changelog, .nav, .atalhos-caixa, .plano-mensal, .mini-projeto, .previa-celular, .modal-caixa, .paleta-caixa, .tour-caixa, .calc-rapida, .status-area, .habilidades";
        // a lente é grande (320px): checa uma grade de pontos espalhados por dentro dela (~28px entre
        // eles), senão um texto pequeno entre dois pontos de amostra passaria sem ser notado
        const AMOSTRAS = [];
        const PASSO = 28;
        for (let raio = 0; raio <= RAIO; raio += PASSO) {
            const pontos = raio === 0 ? 1 : Math.max(6, Math.round((2 * Math.PI * raio) / PASSO));
            for (let i = 0; i < pontos; i++) {
                const ang = (i / pontos) * Math.PI * 2;
                AMOSTRAS.push([Math.round(Math.cos(ang) * raio), Math.round(Math.sin(ang) * raio)]);
            }
        }
        const lente = document.createElement("div");
        lente.className = "reticula-lente";
        lente.setAttribute("aria-hidden", "true");
        const trama = document.createElement("div");
        trama.className = "reticula-trama";
        lente.appendChild(trama);
        document.body.appendChild(lente);
        let x = 0, y = 0, pendente = false;
        const mover = () => {
            pendente = false;
            const lx = Math.round(x - RAIO), ly = Math.round(y - RAIO);
            lente.style.transform = `translate(${lx}px, ${ly}px)`;
            trama.style.transform = `translate(${-lx}px, ${-ly}px)`;
            const temConteudo = AMOSTRAS.some(([dx, dy]) => {
                const alvo = document.elementFromPoint(x + dx, y + dy);
                return alvo && alvo.closest(SELETOR_CONTEUDO);
            });
            lente.classList.toggle("sobre-conteudo", temConteudo);
        };
        addEventListener("pointermove", (e) => {
            if (e.pointerType !== "mouse") return;
            x = e.clientX; y = e.clientY;
            lente.classList.add("ativa");
            if (!pendente) { pendente = true; requestAnimationFrame(mover); }
        }, { passive: true });
        document.documentElement.addEventListener("mouseleave", () => lente.classList.remove("ativa"));
    }

    /* ---------- Figurinhas: número do álbum e raridade em cada projeto ---------- */
    const cards = [...document.querySelectorAll("#lista-projetos .card-projeto")];
    cards.forEach((card, i) => {
        const visual = card.querySelector(".projeto-visual");
        if (!visual || visual.querySelector(".figurinha")) return;
        const cliente = /eclipse/i.test(card.textContent);
        const raridade = cliente ? "lendária" : card.hasAttribute("data-destaque") ? "rara" : "especial";
        const selo = document.createElement("span");
        selo.className = "figurinha figurinha-" + (cliente ? "lendaria" : raridade);
        selo.setAttribute("aria-hidden", "true");
        selo.innerHTML = `<b>#${String(i + 1).padStart(2, "0")}</b><small>${tr(raridade)}</small>`;
        const brilho = document.createElement("span");
        brilho.className = "figurinha-brilho";
        brilho.setAttribute("aria-hidden", "true");
        visual.append(selo, brilho);
    });
    // no celular (sem hover), o brilho passa uma vez quando a figurinha entra na tela
    if (!mouseFino && !semMovimento && "IntersectionObserver" in window) {
        const olho = new IntersectionObserver((entradas) => entradas.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("figurinha-reluz");
            olho.unobserve(e.target);
        }), { threshold: .6 });
        cards.forEach((card) => olho.observe(card));
    }

    /* ---------- Carimbo "APROVADO": bate no orçamento quando a pessoa manda pro WhatsApp ---------- */
    const caixa = document.querySelector(".orcamento-caixa");
    if (caixa) {
        caixa.addEventListener("click", (e) => {
            const antigo = caixa.querySelector(".carimbo-aprovado");
            if (e.target.closest('#orcamentoApp a[href*="wa.me/"]')) {
                antigo?.remove();
                const carimbo = document.createElement("p");
                carimbo.className = "carimbo-aprovado";
                carimbo.setAttribute("aria-hidden", "true");
                carimbo.innerHTML = `${tr("Aprovado!")}<small>${tr("agora é só apertar enviar")}</small>`;
                caixa.appendChild(carimbo);
            } else if (antigo) antigo.remove();
        });
    }
})();
