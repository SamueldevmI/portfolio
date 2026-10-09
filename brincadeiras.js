/* Brincadeiras da página inicial (carrega depois que a página abriu, junto com o gibi.js):
   - tec-tec de teclado mecânico quando a pessoa digita nos campos (só com o áudio liberado: musica.js);
   - modo madrugada: entre meia-noite e 5h o site "percebe" (vinheta escura, luz seguindo o mouse e um aviso);
   - capa de gibi com o nome do negócio da pessoa (imagem 1080 × 1350 pra salvar e postar);
   - o joguinho "Atende aí!" (a caixa dele já vem com a altura reservada no HTML).
   Nada aqui muda a altura da página. Se algo falhar, o resto do site segue igual. */
(function () {
    "use strict";
    const raiz = document.documentElement;
    const tr = (t) => (window.traduzir ? window.traduzir(t) : t);
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches || raiz.classList.contains("modo-simples");
    const som = () => window.musicaSite;
    const ler = (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };
    const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } };
    const avisar = (t) => (typeof window.mostrarToast === "function" ? window.mostrarToast(t) : null);
    const conta = (caminho, titulo) => window.ESTATISTICAS?.contar(caminho, titulo, true);

    /* ---------- 1. tec-tec nos campos de texto ---------- */
    let ultimaTecla = 0;
    document.addEventListener("keydown", (e) => {
        const alvo = e.target;
        if (!alvo.matches || !alvo.matches("input[type=text], input[type=search], input:not([type]), textarea")) return;
        if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;
        const agora = performance.now();
        if (agora - ultimaTecla < 45) return; // segurando a tecla não vira metralhadora
        ultimaTecla = agora;
        som()?.tecla?.();
    }, true);

    /* ---------- 2. modo madrugada (0h às 5h, ou ?madrugada=1 pra testar) ---------- */
    (function madrugada() {
        const hora = new Date().getHours();
        if (!(hora < 5 || /[?&]madrugada=1/.test(location.search))) return;
        raiz.classList.add("madrugada");
        const vinheta = document.createElement("div");
        vinheta.className = "madrugada-vinheta";
        vinheta.setAttribute("aria-hidden", "true");
        document.body.appendChild(vinheta);
        if (!semMovimento && matchMedia("(pointer: fine)").matches) {
            const luz = document.createElement("div");
            luz.className = "madrugada-luz";
            luz.setAttribute("aria-hidden", "true");
            document.body.appendChild(luz);
            let quadro = 0, x = innerWidth / 2, y = innerHeight / 3;
            addEventListener("pointermove", (e) => {
                x = e.clientX; y = e.clientY;
                if (!quadro) quadro = requestAnimationFrame(() => { quadro = 0; luz.style.transform = `translate(${x}px, ${y}px)`; });
            }, { passive: true });
        }
        const relogio = `${String(hora).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
        setTimeout(() => avisar(`🌙 ${relogio}? ${tr("Seu cliente também tá acordado agora 👀")}`), 2500);
        conta("/evento/madrugada", "abriu o site de madrugada");
    })();

    /* ---------- 3. capa de gibi com o nome do negócio ---------- */
    const EMOJI_RAMO = { pizzaria: "🍕", barbearia: "💈", "loja de roupa": "👗", "salão": "💇‍♀️", academia: "🏋️", "clínica": "🩺" };
    function nomeDoNegocio() {
        const campo = document.querySelector(".hero-vitrine .vitrine-nome input");
        return ((campo && campo.value) || ler("portfolio-nome-negocio")).trim().slice(0, 40);
    }
    function quebrar(ctx, texto, largura) {
        const palavras = texto.split(/\s+/), linhas = [];
        let atual = "";
        palavras.forEach((p) => { const teste = atual ? atual + " " + p : p; if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; } else atual = teste; });
        if (atual) linhas.push(atual);
        return linhas;
    }
    function estrela(ctx, cx, cy, pontas, rFora, rDentro, giro) {
        ctx.beginPath();
        for (let i = 0; i < pontas * 2; i++) {
            const r = i % 2 ? rDentro : rFora, a = giro + (i * Math.PI) / pontas;
            ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
    }
    async function desenharCapa(nome) {
        await Promise.all(['400 100px "Bangers"', '700 40px "Space Grotesk"', '500 24px "DM Mono"'].map((f) => document.fonts.load(f).catch(() => null)));
        const W = 1080, H = 1350, c = document.createElement("canvas");
        c.width = W; c.height = H;
        const ctx = c.getContext("2d");
        // papel amarelo com retícula
        ctx.fillStyle = "#ffe14d"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(255,140,0,.22)";
        for (let y = 0; y < H; y += 22) for (let x = (y / 22) % 2 ? 11 : 0; x < W; x += 22) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
        // raios saindo do centro
        ctx.save(); ctx.translate(W / 2, 760); ctx.fillStyle = "rgba(255,255,255,.35)";
        for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -1100); ctx.lineTo(60, -1100); ctx.fill(); }
        ctx.restore();
        // faixa preta do topo
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, W, 150);
        ctx.fillStyle = "#fff"; ctx.font = '400 64px "Bangers"'; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        ctx.fillText(tr("EDIÇÃO DE ESTREIA"), 50, 78);
        ctx.fillStyle = "#ff2a3d"; ctx.fillRect(W - 220, 22, 170, 106);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = '400 84px "Bangers"'; ctx.fillText("#1", W - 135, 80);
        // nome do negócio, gigante
        const titulo = nome.toUpperCase();
        let tam = 170;
        ctx.font = `400 ${tam}px "Bangers"`;
        let linhas = quebrar(ctx, titulo, W - 100);
        while ((linhas.length > 2 || linhas.some((l) => ctx.measureText(l).width > W - 100)) && tam > 70) { tam -= 8; ctx.font = `400 ${tam}px "Bangers"`; linhas = quebrar(ctx, titulo, W - 100); }
        ctx.textAlign = "center"; ctx.lineJoin = "round";
        linhas.slice(0, 2).forEach((l, i) => {
            const y = 270 + i * tam * 0.92;
            ctx.lineWidth = 16; ctx.strokeStyle = "#111"; ctx.strokeText(l, W / 2 + 8, y + 8);
            ctx.fillStyle = "#111"; ctx.fillText(l, W / 2 + 8, y + 8);
            ctx.strokeText(l, W / 2, y); ctx.fillStyle = "#ff2a3d"; ctx.fillText(l, W / 2, y);
        });
        // explosão com o emoji do ramo
        const cy = 780;
        estrela(ctx, W / 2 + 10, cy + 10, 14, 330, 250, 0.1); ctx.fillStyle = "#111"; ctx.fill();
        estrela(ctx, W / 2, cy, 14, 330, 250, 0.1); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = "#111"; ctx.stroke();
        ctx.font = "260px serif"; ctx.textBaseline = "middle";
        ctx.fillText(EMOJI_RAMO[ler("portfolio-tipo-negocio")] || "🚀", W / 2, cy + 10);
        // balão "agora com site!"
        ctx.save(); ctx.font = '400 62px "Bangers"';
        const frase = tr("AGORA COM SITE!"), larg = Math.min(420, ctx.measureText(frase).width + 50), metade = larg / 2;
        ctx.translate(W - 60 - metade, 560); ctx.rotate(0.16);
        ctx.fillStyle = "#111"; ctx.fillRect(-metade + 8, -55 + 8, larg, 110);
        ctx.fillStyle = "#ff2a3d"; ctx.fillRect(-metade, -55, larg, 110); ctx.lineWidth = 6; ctx.strokeRect(-metade, -55, larg, 110);
        ctx.fillStyle = "#fff"; ctx.fillText(frase, 0, 4, larg - 30);
        ctx.restore();
        // legenda do quadrinho
        ctx.fillStyle = "#111"; ctx.fillRect(68, 1138, W - 128, 110);
        ctx.fillStyle = "#fff"; ctx.fillRect(60, 1130, W - 128, 110); ctx.lineWidth = 6; ctx.strokeRect(60, 1130, W - 128, 110);
        ctx.fillStyle = "#111"; ctx.font = '700 44px "Space Grotesk"'; ctx.fillText(tr("O site que vende enquanto você dorme."), W / 2 - 4, 1186);
        // créditos
        ctx.font = '500 24px "DM Mono"'; ctx.fillStyle = "rgba(17,17,17,.75)";
        ctx.fillText(tr("arte: Samuel Mickael · samueldevmi.github.io/portfolio"), W / 2, 1300);
        return c;
    }
    async function gerarCapa() {
        const nome = nomeDoNegocio();
        if (!nome) {
            avisar(tr("Digite o nome do seu negócio no campo do celular primeiro ✏️"));
            const campo = document.querySelector(".hero-vitrine .vitrine-nome input");
            campo?.focus({ preventScroll: false });
            return;
        }
        som()?.hq?.();
        const canvas = await desenharCapa(nome);
        const blob = await new Promise((ok) => canvas.toBlob(ok, "image/jpeg", 0.9));
        const arquivo = `capa-${nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "gibi"}.jpg`;
        conta("/evento/capa-gibi", "gerou a capa de gibi");
        try {
            const f = new File([blob], arquivo, { type: "image/jpeg" });
            if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: nome }); return; }
        } catch (erro) { if (erro && erro.name === "AbortError") return; }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = arquivo;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
        avisar(tr("📰 Capa salva! Posta e me marca 😎"));
    }
    window.gerarCapaGibi = gerarCapa;
    document.addEventListener("click", (e) => { if (e.target.closest("[data-capa-gibi]")) { e.preventDefault(); gerarCapa(); } });

    /* ---------- 4. joguinho "Atende aí!" ---------- */
    (function jogo() {
        const caixa = document.getElementById("jogoAtende");
        if (!caixa) return;
        const tela = caixa.querySelector(".jogo-tela");
        const MSGS = {
            pizzaria: ["tá aberto?", "quanto é a grande?", "entrega no centro?", "tem calabresa?", "aceita pix?", "demora quanto?", "tem borda recheada?"],
            barbearia: ["tem horário hoje?", "corte + barba?", "quanto é?", "abre sábado?", "aceita pix?", "faz degradê?", "tem encaixe agora?"],
            "loja de roupa": ["tem no M?", "ainda tem?", "frete pra onde?", "aceita pix?", "tem preto?", "pode trocar?", "chega quando?"],
            "salão": ["escova hoje?", "quanto a progressiva?", "faz unha?", "tem horário sábado?", "aceita pix?", "demora quanto?", "faz sobrancelha?"],
            academia: ["mensalidade?", "abre domingo?", "aula experimental?", "tem personal?", "aceita pix?", "que horas abre?", "tem plano anual?"],
            "clínica": ["atende convênio?", "horário essa semana?", "quanto a consulta?", "tem estacionamento?", "aceita pix?", "precisa de pedido?", "atende sábado?"],
        };
        const DURACAO = 20000, VIDA = semMovimento ? 3000 : 2200;
        // pegadinhas no meio dos clientes: tocar nelas tira 1 ponto
        const SPAM = ["Bom dia 🌻 repassa pra 10 grupos", "Oi sumido(a) 👀", "🔥 PROMOÇÃO DE CHIP 🔥", "vc viu isso?? 😱 link", "Corrente da sorte 🍀 não quebre", "Parabéns! Você ganhou um iPhone 📱"];
        const CHAVE = "jogo-atende-recorde";
        let rodando = false, fim = 0, proximo = 0, total = 0, atendidos = 0, perdidos = 0, vagas = [], relogio = 0;
        // veio pelo link de desafio de um amigo (?desafio=18): mostra o placar a bater
        const desafio = Math.min(60, Math.max(0, parseInt(new URLSearchParams(location.search).get("desafio"), 10) || 0));

        function inicio() {
            const recorde = ler(CHAVE);
            tela.innerHTML = `<p class="jogo-selo">🎮 ${tr("MINI-JOGO")}</p><h3 class="jogo-titulo">${tr("Atende aí!")}</h3>
                ${desafio ? `<p class="jogo-desafio">🎯 ${tr("Seu amigo atendeu")} <b>${desafio}</b>. ${tr("Bate isso!")}</p>` : ""}
                <p class="jogo-texto">${tr("Toque nas mensagens dos clientes antes que eles desistam. Cuidado com corrente e spam: tocar neles tira ponto. Você tem 20 segundos.")}</p>
                <button type="button" class="botao botao-principal jogo-comecar">${tr("Começar")} ▶</button>
                ${recorde ? `<p class="jogo-recorde">🏆 ${tr("Seu recorde:")} ${recorde}</p>` : ""}`;
        }
        function comecar() {
            rodando = true; total = 0; atendidos = 0; perdidos = 0; vagas = Array(8).fill(null);
            const ramo = MSGS[ler("portfolio-tipo-negocio")] ? ler("portfolio-tipo-negocio") : "pizzaria";
            tela.innerHTML = `<div class="jogo-placar"><span>✅ <b class="jogo-atendidos">0</b></span><span class="jogo-tempo">20s</span><span>😤 <b class="jogo-perdidos">0</b></span></div><div class="jogo-area" data-ramo="${ramo}"></div>`;
            fim = performance.now() + DURACAO; proximo = performance.now() + 400;
            conta("/evento/jogo-comecou", "começou o Atende aí!");
            relogio = requestAnimationFrame(passo);
        }
        function passo(agora) {
            if (!rodando) return;
            if (document.hidden) { terminar(); return; }
            const resta = Math.max(0, fim - agora);
            const t = tela.querySelector(".jogo-tempo"); if (t) t.textContent = Math.ceil(resta / 1000) + "s";
            if (resta <= 0) { terminar(); return; }
            if (agora >= proximo) {
                const progresso = 1 - resta / DURACAO;
                novaMensagem(agora, progresso);
                if (progresso > .45 && Math.random() < .35) novaMensagem(agora, progresso); // rajada: duas de uma vez
                proximo = agora + (880 - progresso * 480) * (0.8 + Math.random() * 0.4); // vai apertando
            }
            tela.querySelectorAll(".jogo-msg:not(.ok):not(.foi)").forEach((m) => { if (agora > Number(m.dataset.ate)) (m.dataset.spam ? sumiu(m) : desistiu(m)); });
            relogio = requestAnimationFrame(passo);
        }
        function novaMensagem(agora, progresso) {
            const livres = vagas.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
            if (!livres.length) return;
            const i = livres[Math.floor(Math.random() * livres.length)];
            const area = tela.querySelector(".jogo-area");
            const lista = MSGS[area.dataset.ramo];
            const m = document.createElement("button");
            m.type = "button";
            m.className = "jogo-msg";
            m.style.setProperty("--col", i % 2);
            m.style.setProperty("--lin", Math.floor(i / 2));
            m.style.setProperty("--vida", VIDA + "ms");
            m.dataset.ate = agora + VIDA;
            m.dataset.vaga = i;
            const spam = progresso > .12 && Math.random() < .22;
            const texto = spam ? SPAM[Math.floor(Math.random() * SPAM.length)] : lista[Math.floor(Math.random() * lista.length)];
            if (spam) { m.dataset.spam = "1"; m.classList.add("spam"); }
            m.innerHTML = `<span>${tr(texto)}</span><i aria-hidden="true"></i>`;
            vagas[i] = m;
            if (!spam) total++;
            area.appendChild(m);
            som()?.plim?.();
        }
        function sumiu(m) { m.classList.add("foi"); liberar(m, 300); } // spam que ninguém tocou: só some, sem contar
        function liberar(m, ms) { setTimeout(() => { vagas[Number(m.dataset.vaga)] = null; m.remove(); }, ms); }
        function desistiu(m) {
            m.classList.add("foi"); m.querySelector("span").textContent = tr("desistiu 😤");
            perdidos++;
            const p = tela.querySelector(".jogo-perdidos"); if (p) p.textContent = perdidos;
            liberar(m, 650);
        }
        function atender(m) {
            if (!rodando || m.classList.contains("ok") || m.classList.contains("foi")) return;
            if (m.dataset.spam) {
                m.classList.add("foi", "caiu"); m.querySelector("span").textContent = tr("era spam! −1 😵");
                atendidos = Math.max(0, atendidos - 1);
                const a = tela.querySelector(".jogo-atendidos"); if (a) a.textContent = atendidos;
                som()?.erro?.();
                liberar(m, 600);
                return;
            }
            m.classList.add("ok"); m.querySelector("span").textContent = tr("respondido ✓");
            atendidos++;
            const a = tela.querySelector(".jogo-atendidos"); if (a) a.textContent = atendidos;
            som()?.nota?.(84, 0.8);
            liberar(m, 450);
        }
        function terminar() {
            rodando = false; cancelAnimationFrame(relogio);
            perdidos = Math.max(0, total - atendidos); // quem ainda estava esperando no fim também ficou sem resposta
            const recorde = Number(ler(CHAVE)) || 0;
            const novo = atendidos > recorde;
            if (novo) gravar(CHAVE, String(atendidos));
            document.dispatchEvent(new CustomEvent("jogoAtendeFim", { detail: { atendidos, total } })); // o álbum de figurinhas escuta
            if (atendidos && perdidos === 0) som()?.kaching?.(); else som()?.erro?.();
            conta("/evento/jogo-terminou", "terminou o Atende aí!");
            const frase = perdidos === 0
                ? tr("Atendeu todo mundo! Agora imagina fazer isso o dia inteiro, todo dia… O site faz.")
                : `${perdidos} ${perdidos === 1 ? tr("cliente desistiu e foi pro concorrente.") : tr("clientes desistiram e foram pro concorrente.")} ${tr("O site teria atendido os")} ${total}. ${tr("Enquanto você dormia.")}`;
            const placarDesafio = !desafio ? "" : atendidos > desafio
                ? `<p class="jogo-desafio">🥇 ${tr("Ganhou do seu amigo!")} (${atendidos} × ${desafio})</p>`
                : atendidos === desafio ? `<p class="jogo-desafio">🤝 ${tr("Empatou com seu amigo!")} (${atendidos} × ${desafio})</p>`
                : `<p class="jogo-desafio">😅 ${tr("Seu amigo ainda ganha")} (${atendidos} × ${desafio})</p>`;
            tela.innerHTML = `<p class="jogo-selo">${novo ? "🏆 " + tr("NOVO RECORDE!") : "⏱️ " + tr("ACABOU O TEMPO")}</p>
                <p class="jogo-resultado"><b>${atendidos}</b> ${tr("de")} ${total}</p>${placarDesafio}
                <p class="jogo-texto">${frase}</p>
                <div class="jogo-acoes">
                    <button type="button" class="botao botao-principal" data-orcamento-tipo="site">${tr("Quero um site que atende sozinho")}</button>
                    <button type="button" class="botao botao-secundario jogo-de-novo">${tr("Jogar de novo")} ↻</button>
                    <button type="button" class="botao botao-secundario jogo-desafiar">${tr("Desafiar um amigo")} 🤝</button>
                </div>`;
            tela.dataset.atendidos = atendidos; tela.dataset.total = total;
        }
        async function desafiar() {
            const texto = `${tr("Atendi")} ${tela.dataset.atendidos} ${tr("de")} ${tela.dataset.total} ${tr("clientes no “Atende aí!” do Samuel. Duvido você bater 😏")}`;
            const url = `${location.origin}${location.pathname}?desafio=${Number(tela.dataset.atendidos) || 0}#jogoAtende`;
            try { if (navigator.share) { await navigator.share({ text: texto, url }); return; } } catch (e) { if (e.name === "AbortError") return; }
            try { await navigator.clipboard.writeText(`${texto} ${url}`); avisar(tr("Desafio copiado! Cola no WhatsApp de alguém 😈")); } catch (e) { /* sem área de transferência */ }
        }
        caixa.addEventListener("click", (e) => {
            const msg = e.target.closest(".jogo-msg"); if (msg) { atender(msg); return; }
            if (e.target.closest(".jogo-comecar, .jogo-de-novo")) comecar();
            else if (e.target.closest(".jogo-desafiar")) desafiar();
        });
        document.addEventListener("idiomaMudou", () => { if (!rodando) inicio(); });
        inicio();
    })();
})();
