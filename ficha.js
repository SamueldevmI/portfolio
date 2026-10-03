/* Sobre mim: a ficha de personagem de HQ e o "Converse comigo".
   - A ficha vira com um "POW!" (toque/clique nela ou no botão), inclina com o mouse com brilho
     holográfico e pode ser salva como imagem (no celular abre o compartilhar).
   - O "Converse comigo" responde com as mesmas palavras das Perguntas frequentes: a resposta é lida
     da própria FAQ na hora, então mudou lá, muda aqui (e já vem no idioma escolhido).
   Arquivo separado: se algo falhar aqui, o resto do site segue igual. */
(function () {
    "use strict";
    const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const traduzir = (texto) => (window.traduzir ? window.traduzir(texto) : texto);

    /* ---------- Ficha de personagem ---------- */
    (function ficha() {
        const cartao = document.getElementById("ficha");
        if (!cartao) return;
        const botao = document.getElementById("fichaVirar");
        const frente = cartao.querySelector(".ficha-frente");
        const verso = cartao.querySelector(".ficha-verso");
        const pow = cartao.querySelector(".ficha-pow");

        // o lado de trás não recebe foco nem é lido enquanto está virado pra parede
        verso.inert = true;
        function virar() {
            const virada = cartao.classList.toggle("virada");
            frente.inert = virada;
            verso.inert = !virada;
            botao.setAttribute("aria-pressed", String(virada));
            if (!semMovimento) {
                pow.textContent = virada ? "POW!" : "VUPT!";
                pow.style.setProperty("--giro", virada ? "-8deg" : "6deg");
                pow.classList.remove("ativo");
                void pow.offsetWidth; // reinicia a animação
                pow.classList.add("ativo");
            }
        }
        botao.addEventListener("click", virar);
        cartao.addEventListener("click", (e) => {
            if (e.target.closest("a, button")) return;
            if (getSelection && String(getSelection()).length) return; // estava selecionando texto
            virar();
        });
        pow.addEventListener("animationend", () => pow.classList.remove("ativo"));

        // barras dos atributos enchem quando a ficha aparece
        if ("IntersectionObserver" in window) {
            const olho = new IntersectionObserver((entradas) => {
                if (entradas.some((e) => e.isIntersecting)) { cartao.classList.add("vista"); olho.disconnect(); }
            }, { threshold: .35 });
            olho.observe(cartao);
        } else cartao.classList.add("vista");

        // inclinação 3D com brilho holográfico: só com mouse (no celular o dedo rola a página)
        if (!semMovimento && matchMedia("(hover: hover) and (pointer: fine)").matches) {
            let quadro = 0, x = .5, y = .5;
            const aplicar = () => {
                quadro = 0;
                cartao.style.setProperty("--rx", ((.5 - y) * 12).toFixed(2) + "deg");
                cartao.style.setProperty("--ry", ((x - .5) * (cartao.classList.contains("virada") ? -14 : 14)).toFixed(2) + "deg");
                cartao.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
                cartao.style.setProperty("--my", (y * 100).toFixed(1) + "%");
            };
            cartao.addEventListener("pointermove", (e) => {
                if (e.pointerType !== "mouse") return;
                const r = cartao.getBoundingClientRect();
                x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
                y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
                cartao.classList.add("inclinando");
                if (!quadro) quadro = requestAnimationFrame(aplicar);
            });
            cartao.addEventListener("pointerleave", () => {
                cancelAnimationFrame(quadro); quadro = 0;
                cartao.classList.remove("inclinando");
                ["--rx", "--ry"].forEach((v) => cartao.style.setProperty(v, "0deg"));
            });
        }

        // missões cumpridas: números de verdade (projetos do site e contribuições no GitHub)
        const statProjetos = document.getElementById("statProjetos");
        const fichaProjetos = document.getElementById("fichaProjetos");
        if (statProjetos && fichaProjetos && statProjetos.dataset.contar) fichaProjetos.textContent = statProjetos.dataset.contar;
        const linhaGithub = document.getElementById("fichaGithub");
        function mostrarGithub(total) {
            if (!linhaGithub || !(total > 0)) return;
            linhaGithub.querySelector("strong").textContent = Number(total).toLocaleString("pt-BR");
            linhaGithub.hidden = false;
        }
        mostrarGithub(window.githubTotalAno);
        document.addEventListener("github:total", (e) => mostrarGithub(e.detail.total));

        /* ---------- Salvar a ficha como imagem (1080x1350, o tamanho de post) ---------- */
        const salvar = document.getElementById("fichaSalvar");
        const texto = (seletor) => (cartao.querySelector(seletor)?.textContent || "").replace(/\s+/g, " ").trim();
        function quebrar(ctx, frase, largura) {
            const linhas = [];
            let atual = "";
            frase.split(" ").forEach((palavra) => {
                const teste = atual ? atual + " " + palavra : palavra;
                if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = palavra; } else atual = teste;
            });
            if (atual) linhas.push(atual);
            return linhas;
        }
        function carregarFoto() {
            return new Promise((ok) => {
                const img = new Image();
                img.onload = () => ok(img);
                img.onerror = () => ok(null);
                img.src = "imagem/minhafoto-1080.webp";
            });
        }
        async function desenhar() {
            const azul = document.documentElement.dataset.tema === "azul";
            const COR = azul ? { forte: "#2563d8", meio: "#163c8a", fundo: "#0b1630", destaque: "#2e7dff" } : { forte: "#b0222a", meio: "#6b1414", fundo: "#2a0b0b", destaque: "#ff2a3d" };
            await Promise.all(["700 80px 'Space Grotesk'", "500 30px 'DM Mono'"].map((f) => document.fonts?.load(f).catch(() => null)));
            const foto = await carregarFoto();
            const W = 1080, H = 1350;
            const tela = document.createElement("canvas");
            tela.width = W; tela.height = H;
            const ctx = tela.getContext("2d");
            const fundo = ctx.createLinearGradient(0, 0, W * .6, H);
            fundo.addColorStop(0, COR.forte); fundo.addColorStop(.52, COR.meio); fundo.addColorStop(1, COR.fundo);
            ctx.fillStyle = fundo;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = "rgba(0,0,0,.26)";
            for (let y = 8; y < H; y += 18) for (let x = (y / 18) % 2 ? 17 : 8; x < W; x += 18) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); }
            // moldura de carta: branco por fora, preto por dentro
            ctx.lineWidth = 22; ctx.strokeStyle = "#f2f2f2"; ctx.strokeRect(11, 11, W - 22, H - 22);
            ctx.lineWidth = 10; ctx.strokeStyle = "#111111"; ctx.strokeRect(27, 27, W - 54, H - 54);

            ctx.fillStyle = "rgba(255,255,255,.85)";
            ctx.font = "500 26px 'DM Mono', monospace";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(traduzir("FICHA DE PERSONAGEM"), 72, 98);
            ctx.textAlign = "right"; ctx.fillText("Nº 001", W - 72, 98); ctx.textAlign = "left";

            // foto num quadro de HQ
            const fx = 72, fy = 126, fw = W - 144, fh = 540;
            ctx.fillStyle = "#111111"; ctx.fillRect(fx + 10, fy + 10, fw, fh);
            if (foto) {
                const escala = Math.max(fw / foto.width, fh / foto.height);
                const sw = fw / escala, sh = fh / escala;
                ctx.save();
                ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
                ctx.filter = "grayscale(1) contrast(1.06)";
                ctx.drawImage(foto, (foto.width - sw) / 2, (foto.height - sh) * .32, sw, sh, fx, fy, fw, fh);
                ctx.restore();
            } else { ctx.fillStyle = "#262626"; ctx.fillRect(fx, fy, fw, fh); }
            ctx.lineWidth = 8; ctx.strokeStyle = "#111111"; ctx.strokeRect(fx, fy, fw, fh);

            // selo do nível
            ctx.save();
            ctx.translate(fx + fw - 92, fy + fh - 24);
            ctx.rotate(-.17);
            ctx.fillStyle = "#111111"; ctx.beginPath(); ctx.arc(7, 7, 82, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, 0, 76, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 7; ctx.stroke();
            ctx.textAlign = "center";
            ctx.fillStyle = "#111111"; ctx.font = "700 20px 'DM Mono', monospace"; ctx.fillText(traduzir("NÍVEL"), 0, -18);
            ctx.fillStyle = COR.destaque; ctx.font = "800 70px 'Space Grotesk', sans-serif"; ctx.fillText(texto(".ficha-nivel b"), 0, 46);
            ctx.restore();

            // nome com sombra de quadrinho
            ctx.font = "700 88px 'Space Grotesk', sans-serif";
            const nome = texto(".ficha-nome").toUpperCase();
            ctx.fillStyle = "#111111"; ctx.fillText(nome, 78, 778);
            ctx.fillStyle = "#ffffff"; ctx.fillText(nome, 72, 772);
            ctx.font = "500 28px 'DM Mono', monospace";
            ctx.fillStyle = "rgba(255,255,255,.92)";
            const [classe, cidade] = [...cartao.querySelectorAll(".ficha-classe > span")].map((s) => s.textContent.replace(/\s+/g, " ").trim());
            ctx.fillText(classe, 74, 824);
            ctx.textAlign = "right"; ctx.fillText(cidade.replace("📍", "").trim(), W - 74, 824); ctx.textAlign = "left";

            // superpoder numa caixa de narração
            ctx.font = "700 34px 'Space Grotesk', sans-serif";
            const poder = quebrar(ctx, texto(".ficha-poder p"), W - 200);
            const ch = 64 + poder.length * 42;
            ctx.save();
            ctx.translate(72, 856); ctx.rotate(-.012);
            ctx.fillStyle = "#111111"; ctx.fillRect(8, 8, W - 144, ch);
            ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W - 144, ch);
            ctx.lineWidth = 6; ctx.strokeRect(0, 0, W - 144, ch);
            ctx.fillStyle = COR.destaque === "#2e7dff" ? "#1d4fb8" : "#c41f2a";
            ctx.font = "700 22px 'DM Mono', monospace"; ctx.fillText(traduzir("SUPERPODER"), 24, 40);
            ctx.fillStyle = "#111111"; ctx.font = "700 34px 'Space Grotesk', sans-serif";
            poder.forEach((l, i) => ctx.fillText(l, 24, 84 + i * 42));
            ctx.restore();

            // atributos
            let y = 856 + ch + 56;
            cartao.querySelectorAll(".ficha-atributos li").forEach((li) => {
                const v = Number(li.style.getPropertyValue("--v")) || 0;
                ctx.fillStyle = "#ffffff"; ctx.font = "600 27px 'Space Grotesk', sans-serif";
                ctx.fillText(li.querySelector("span").textContent, 74, y);
                const bx = 560, bw = 340;
                ctx.fillStyle = "#111111"; ctx.fillRect(bx, y - 24, bw, 26);
                ctx.fillStyle = li.classList.contains("ficha-max") ? COR.destaque : "#ffffff";
                ctx.fillRect(bx + 4, y - 20, (bw - 8) * Math.min(1, v / 100), 18);
                ctx.font = "500 24px 'DM Mono', monospace"; ctx.fillStyle = "#ffffff";
                ctx.textAlign = "right"; ctx.fillText(li.querySelector("b").textContent, W - 74, y); ctx.textAlign = "left";
                y += 44;
            });
            ctx.fillStyle = "rgba(255,255,255,.8)";
            ctx.font = "500 24px 'DM Mono', monospace";
            ctx.textAlign = "center"; ctx.fillText("samueldevmi.github.io/portfolio", W / 2, H - 58);
            return tela;
        }
        if (salvar) salvar.addEventListener("click", async () => {
            salvar.disabled = true;
            try {
                const tela = await desenhar();
                const blob = await new Promise((ok) => tela.toBlob(ok, "image/png"));
                const arquivo = new File([blob], "ficha-samuel-mickael.png", { type: "image/png" });
                const toque = matchMedia("(pointer: coarse)").matches;
                if (toque && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
                    try { await navigator.share({ files: [arquivo], title: "Samuel Mickael", text: "samueldevmi.github.io/portfolio" }); return; }
                    catch (erro) { if (erro && erro.name === "AbortError") return; }
                }
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = arquivo.name;
                document.body.appendChild(link); link.click(); link.remove();
                setTimeout(() => URL.revokeObjectURL(link.href), 4000);
            } finally {
                salvar.disabled = false;
            }
        });
    })();

    /* ---------- Mais projetos como conquistas: desbloqueiam uma a uma quando a seção aparece ---------- */
    (function conquistas() {
        const lista = document.querySelector(".lista-conquistas");
        if (!lista) return;
        const todas = [...lista.querySelectorAll(".conquista")];
        const feitas = todas.filter((li) => !li.classList.contains("conquista-bloqueada"));
        const barra = document.querySelector(".conquistas-barra i");
        const contador = document.getElementById("conquistasFeitas");
        document.getElementById("conquistasTotal").textContent = todas.length;
        const progresso = (n) => {
            contador.textContent = n;
            if (barra) barra.style.setProperty("--p", (n / todas.length).toFixed(3));
        };
        if (semMovimento || !("IntersectionObserver" in window)) { progresso(feitas.length); return; }
        lista.classList.add("conquistas-animar");
        progresso(0);
        const NOTAS = [79, 84, 88, 91];
        const olho = new IntersectionObserver((entradas) => {
            if (!entradas.some((e) => e.isIntersecting)) return;
            olho.disconnect();
            feitas.forEach((li, n) => setTimeout(() => {
                li.classList.add("desbloqueada", "desbloqueando");
                progresso(n + 1);
                const m = window.musicaSite; // "plim" só com a música do site ligada
                if (m && m.tocando && m.tocando()) m.nota(NOTAS[n % NOTAS.length], .6);
            }, 300 + n * 420));
        }, { threshold: .2 });
        olho.observe(lista);
    })();

    /* ---------- Converse comigo ---------- */
    (function papo() {
        const raiz = document.getElementById("papo");
        if (!raiz) return;
        const caixa = document.getElementById("papoMensagens");
        const status = document.getElementById("papoStatus");
        const perguntas = raiz.querySelectorAll(".papo-perguntas button");
        let ocupado = false;
        let geracao = 0; // trocar de idioma no meio de uma resposta cancela o resto dela

        const hora = () => new Date().toLocaleTimeString(document.documentElement.lang === "es" ? "es" : "pt-BR", { hour: "2-digit", minute: "2-digit" });
        const rolar = () => { caixa.scrollTop = caixa.scrollHeight; };
        function bolha(texto, quem) {
            const p = document.createElement("p");
            p.className = "papo-msg papo-" + quem;
            p.textContent = texto;
            const quando = document.createElement("small");
            quando.textContent = hora() + " ";
            if (quem === "meu") { const lido = document.createElement("b"); lido.textContent = "✓✓"; lido.setAttribute("aria-hidden", "true"); quando.appendChild(lido); }
            p.appendChild(quando);
            caixa.appendChild(p);
            rolar();
        }
        // a resposta é o texto da FAQ, sem o que estiver escondido (ex.: promoção que já acabou)
        function resposta(id) {
            const alvo = document.getElementById(id);
            if (!alvo) return "";
            const p = alvo.matches("p") ? alvo : alvo.querySelector("p");
            const copia = p.cloneNode(true);
            copia.querySelectorAll("[hidden]").forEach((x) => x.remove());
            return copia.textContent.replace(/\s+/g, " ").trim();
        }
        // resposta comprida vira duas ou três bolhas, como gente digita no WhatsApp
        function picotar(texto) {
            const frases = texto.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [texto];
            const partes = [];
            frases.forEach((f) => {
                const ultima = partes[partes.length - 1];
                if (ultima && (ultima + f).length < 170) partes[partes.length - 1] = ultima + f;
                else partes.push(f);
            });
            return partes.map((x) => x.trim()).filter(Boolean);
        }
        const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
        function digitando(liga) {
            status.textContent = traduzir(liga ? "digitando…" : "online");
            status.classList.toggle("digitando", liga);
            caixa.querySelector(".papo-digitando")?.remove();
            if (liga) {
                const p = document.createElement("p");
                p.className = "papo-msg papo-dele papo-digitando";
                p.setAttribute("aria-hidden", "true");
                p.innerHTML = "<i></i><i></i><i></i>";
                caixa.appendChild(p);
                rolar();
            }
        }
        async function perguntar(botao) {
            if (ocupado) return;
            const texto = resposta(botao.dataset.faq);
            if (!texto) return;
            ocupado = true;
            const minha = geracao;
            perguntas.forEach((b) => b.setAttribute("aria-disabled", "true"));
            botao.classList.add("ja");
            bolha(botao.textContent.trim(), "meu");
            for (const parte of picotar(texto)) {
                await esperar(semMovimento ? 150 : 350);
                if (minha !== geracao) return;
                digitando(true);
                await esperar(semMovimento ? 250 : Math.min(1900, 550 + parte.length * 11));
                if (minha !== geracao) return;
                digitando(false);
                bolha(parte, "dele");
            }
            perguntas.forEach((b) => b.removeAttribute("aria-disabled"));
            ocupado = false;
        }
        perguntas.forEach((b) => b.addEventListener("click", () => perguntar(b)));

        // trocou o idioma: a conversa recomeça (a saudação fixa já vem traduzida pelo idioma.js)
        document.addEventListener("idiomaMudou", () => {
            geracao++;
            caixa.querySelectorAll(".papo-msg:not(:first-child)").forEach((m) => m.remove());
            digitando(false);
            perguntas.forEach((b) => { b.classList.remove("ja"); b.removeAttribute("aria-disabled"); });
            ocupado = false;
        });
    })();
})();
