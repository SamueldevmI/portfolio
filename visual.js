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

    /* ---------- Álbum: abriu um projeto (testar, demo, tecnologias), cola a figurinha dele ----------
       Fica guardado neste aparelho. PREMIO vazio = completar só dá os parabéns; com texto, ele aparece. */
    const PREMIO = ""; // ex.: "10% de desconto no seu site" (só coloque o que você vai cumprir)
    const album = document.getElementById("album");
    if (album && cards.length) {
        const CHAVE = "portfolio-album";
        const nomeDo = (card) => card.querySelector(".projeto-nome")?.textContent.trim() || "";
        let coladas = [];
        try { coladas = JSON.parse(localStorage.getItem(CHAVE) || "[]"); } catch (e) { /* sem armazenamento */ }
        const total = cards.length, slots = [...album.querySelectorAll(".album-slots li")];
        const conta = album.querySelector(".album-conta"), dica = album.querySelector(".album-dica");
        const desenhar = (nova) => {
            const n = cards.filter((c) => coladas.includes(nomeDo(c))).length;
            conta.textContent = `${n}/${total}`;
            slots.forEach((li, i) => { li.classList.toggle("colada", i < n); li.classList.toggle("acabou-de-colar", nova && i === n - 1); });
            if (n >= total && !album.classList.contains("completo")) {
                album.classList.add("completo");
                const msg = encodeURIComponent("Oi, Samuel! Completei o álbum de figurinhas do seu site 🏆 e queria conversar sobre um projeto.");
                dica.innerHTML = `${tr("Álbum completo! 🏆")} ${PREMIO ? tr(PREMIO) + " · " : ""}<a class="album-completo-link" href="https://wa.me/5567996034205?text=${msg}" target="_blank" rel="noopener noreferrer">${tr("Contar pro Samuel →")}</a>`;
                if (nova) window.musicaSite?.subida?.();
            }
        };
        desenhar(false);
        document.getElementById("lista-projetos").addEventListener("click", (e) => {
            const card = e.target.closest(".card-projeto");
            if (!card || !e.target.closest("a, button") || e.target.closest(".botao-compartilhar, .card-orcamento")) return;
            const nome = nomeDo(card);
            if (!nome || coladas.includes(nome)) return;
            coladas.push(nome);
            try { localStorage.setItem(CHAVE, JSON.stringify(coladas)); } catch (e2) { /* só não lembra */ }
            desenhar(true);
        });
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
