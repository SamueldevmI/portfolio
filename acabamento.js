/* Acabamento visual do portfólio: gráfico do GitHub nas cores do site e pontos do carrossel de projetos.
   Arquivo separado de propósito: não depende do script.js e, se algo falhar aqui, o resto do site segue igual. */
(function () {
    "use strict";

    /* ---------- Atividade do GitHub, desenhada aqui em vez da imagem de terceiros ---------- */
    (function grafico() {
        const desenho = document.getElementById("ghDesenho");
        if (!desenho) return;
        const USUARIO = "SamueldevmI";
        const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const FOLGA = 4;
        const total = document.getElementById("ghTotal");
        const imagemAntiga = document.querySelector(".github-atividade > img");
        let rolagem = null;
        let colunas = 0;

        function ajustar() {
            if (!rolagem || !colunas) return;
            const cel = Math.max(12, Math.min(30, Math.floor((rolagem.clientWidth - 6 - (colunas - 1) * FOLGA) / colunas)));
            desenho.style.setProperty("--gh-cel", cel + "px");
        }

        function janelaRecente(todos) {
            // Comeca 2 semanas antes da primeira atividade, mas mostra sempre de 12 a 16 semanas.
            const primeiroAtivo = todos.findIndex(function (d) { return d.count > 0; });
            let inicio = primeiroAtivo < 0 ? todos.length - 84 : primeiroAtivo - 14;
            inicio = Math.min(inicio, todos.length - 84);
            inicio = Math.max(inicio, todos.length - 112, 0);
            return todos.slice(inicio);
        }

        function numeros(janela) {
            let soma = 0, ativos = 0, seq = 0, recorde = 0;
            janela.forEach(function (d) {
                soma += d.count;
                if (d.count > 0) { ativos++; seq++; recorde = Math.max(recorde, seq); } else { seq = 0; }
            });
            // sequencia atual: dias seguidos ate hoje (hoje ainda sem commit nao zera a sequencia)
            let atual = 0;
            for (let i = janela.length - 1; i >= 0; i--) {
                if (janela[i].count > 0) atual++;
                else if (i === janela.length - 1) continue;
                else break;
            }
            return { soma: soma, ativos: ativos, atual: atual, recorde: recorde };
        }

        function desenhar(todos, somaAno) {
            const dias = janelaRecente(todos);
            const n = numeros(dias);
            const semanas = Math.round(dias.length / 7);
            const primeiro = new Date(dias[0].date + "T12:00:00").getDay(); // 0 = domingo, como no GitHub
            colunas = Math.ceil((dias.length + primeiro) / 7);

            const grade = document.createElement("div");
            grade.className = "gh-grade";
            const meses = document.createElement("div");
            meses.className = "gh-meses";
            meses.style.gridTemplateColumns = "repeat(" + colunas + ", var(--gh-cel))";

            let ultimoMes = -1;
            let ultimaColuna = -10;
            dias.forEach(function (d, i) {
                const data = new Date(d.date + "T12:00:00");
                const celula = document.createElement("span");
                celula.className = "gh-dia";
                celula.dataset.n = d.level;
                const dia = data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
                celula.title = (d.count === 0 ? "Nenhuma contribuição" : d.count + (d.count === 1 ? " contribuição" : " contribuições")) + " em " + dia;
                if (i === 0) celula.style.gridRowStart = primeiro + 1;
                grade.appendChild(celula);

                const coluna = Math.floor((i + primeiro) / 7);
                const mes = data.getMonth();
                if (mes !== ultimoMes && (i === 0 || data.getDate() <= 7)) {
                    ultimoMes = mes;
                    if (coluna - ultimaColuna >= 3) {
                        const rotulo = document.createElement("span");
                        rotulo.textContent = MESES[mes];
                        rotulo.style.gridColumn = (coluna + 1) + " / span 3";
                        meses.appendChild(rotulo);
                        ultimaColuna = coluna;
                    }
                }
            });

            rolagem = document.createElement("div");
            rolagem.className = "gh-rolagem";
            const miolo = document.createElement("div");
            miolo.appendChild(meses);
            miolo.appendChild(grade);
            rolagem.appendChild(miolo);

            const legenda = document.createElement("div");
            legenda.className = "gh-legenda";
            legenda.setAttribute("aria-hidden", "true");
            legenda.innerHTML = "menos <i data-n='0'></i><i data-n='1'></i><i data-n='2'></i><i data-n='3'></i><i data-n='4'></i> mais";

            const painel = document.createElement("div");
            painel.className = "gh-numeros";
            painel.innerHTML =
                "<div><b>" + n.soma + "</b><span>contribuições em " + semanas + " semanas</span></div>" +
                "<div><b>" + n.ativos + "</b><span>dias com atividade</span></div>" +
                "<div><b>" + n.atual + "</b><span>" + (n.atual === 1 ? "dia seguido" : "dias seguidos") + " (recorde " + n.recorde + ")</span></div>";
            const mapa = document.createElement("div");
            mapa.className = "gh-mapa";
            mapa.appendChild(rolagem);
            mapa.appendChild(legenda);
            const corpo = document.createElement("div");
            corpo.className = "gh-corpo";
            corpo.appendChild(painel);
            corpo.appendChild(mapa);

            desenho.textContent = "";
            desenho.setAttribute("role", "img");
            desenho.setAttribute("aria-label", "Contribuições no GitHub de " + USUARIO + " nas últimas " + semanas + " semanas: " + n.soma + " em " + n.ativos + " dias com atividade");
            desenho.appendChild(corpo);
            desenho.hidden = false;
            if (imagemAntiga) imagemAntiga.hidden = true;
            if (total) {
                total.innerHTML = "<b>" + somaAno + "</b> contribuições no último ano";
                total.hidden = false;
            }
            ajustar();
            rolagem.scrollLeft = rolagem.scrollWidth; // no celular começa pelo mais recente
        }

        function mostrarImagemReserva() {
            // O gráfico novo não veio (sem rede, serviço fora do ar): só agora baixa a imagem de antes.
            if (imagemAntiga && imagemAntiga.dataset.src && !imagemAntiga.getAttribute("src")) {
                // Se a reserva também falhar, esconde o quadro inteiro em vez de mostrar imagem quebrada.
                imagemAntiga.addEventListener("error", function () { desenho.parentElement.style.display = "none"; }, { once: true });
                imagemAntiga.src = imagemAntiga.dataset.src;
                imagemAntiga.hidden = false;
            }
        }

        function carregar() {
            fetch("https://github-contributions-api.jogruber.de/v4/" + USUARIO + "?y=last")
                .then(function (resposta) { return resposta.ok ? resposta.json() : Promise.reject(new Error("sem dados")); })
                .then(function (dados) {
                    const dias = dados && dados.contributions;
                    if (!Array.isArray(dias) || dias.length < 30) { mostrarImagemReserva(); return; }
                    const soma = (dados.total && dados.total.lastYear) || dias.reduce(function (s, d) { return s + d.count; }, 0);
                    desenhar(dias, soma);
                })
                .catch(mostrarImagemReserva);
        }

        // Só busca quando o gráfico está perto de aparecer: no celular poupa uma conexão e dados na abertura da página.
        const caixa = desenho.parentElement;
        if ("IntersectionObserver" in window && caixa) {
            const observador = new IntersectionObserver(function (entradas) {
                if (entradas.some(function (e) { return e.isIntersecting; })) {
                    observador.disconnect();
                    carregar();
                }
            }, { rootMargin: "700px 0px" });
            observador.observe(caixa);
        } else {
            carregar();
        }

        let espera = 0;
        window.addEventListener("resize", function () {
            clearTimeout(espera);
            espera = setTimeout(ajustar, 120);
        });
    })();

    /* ---------- Botão Voltar do celular fecha a janela aberta em vez de sair do site ----------
       A demonstração, a paleta de comandos e o tour abrem por cima da página sem criar entrada no histórico,
       então o Voltar do Android levava a pessoa embora do portfólio. Aqui, ao abrir uma janela criamos UMA
       entrada; o Voltar consome essa entrada e fecha a janela pelo botão dela (com a limpeza de sempre).
       Se a janela fecha por outro caminho (X, Esc, clique no fundo), devolvemos a entrada com history.back(). */
    (function voltar() {
        if (!window.history || !history.pushState) return;
        const janelas = [
            { el: document.getElementById("modalOverlay"), fechar: function () { const b = document.getElementById("modalFechar"); if (b) b.click(); } },
            { el: document.getElementById("paletaOverlay"), fechar: function () { document.getElementById("paletaOverlay").click(); } },
            { el: document.getElementById("tourOverlay"), fechar: function () { const b = document.getElementById("tourPular"); if (b) b.click(); } }
        ].filter(function (j) { return j.el; });
        if (!janelas.length) return;

        let entrada = false;   // já criamos a entrada de histórico para "há janela aberta"?
        let ignorar = 0;       // popstates provocados por nós mesmos (history.back())
        let agendado = false;

        function abertas() { return janelas.filter(function (j) { return !j.el.hidden; }); }

        function conciliar() {
            agendado = false;
            const algumaAberta = abertas().length > 0;
            if (algumaAberta && !entrada) {
                history.pushState({ sobreposicao: true }, "");
                entrada = true;
            } else if (!algumaAberta && entrada) {
                entrada = false;
                ignorar++;
                history.back();
            }
        }

        // Concilia depois que todas as mudanças da mesma vez terminaram (ex.: a paleta fecha e o tour abre juntos).
        function agendar() {
            if (agendado) return;
            agendado = true;
            Promise.resolve().then(conciliar);
        }

        janelas.forEach(function (j) {
            new MutationObserver(agendar).observe(j.el, { attributes: true, attributeFilter: ["hidden"] });
        });

        window.addEventListener("popstate", function () {
            if (ignorar > 0) { ignorar--; return; }
            if (!entrada) return;
            entrada = false;   // o navegador já consumiu a nossa entrada
            abertas().forEach(function (j) { j.fechar(); });
        });
    })();

    /* ---------- Pontinhos do carrossel de projetos (só no celular) ---------- */
    (function carrossel() {
        /* só os projetos em destaque viram carrossel; os outros ficam em lista embaixo */
        const lista = document.querySelector("#lista-projetos .destaques") || document.getElementById("lista-projetos");
        if (!lista) return;
        const celular = window.matchMedia("(max-width: 720px)");
        let pontos = null;
        let quantos = -1;
        let quadro = 0;

        function visiveis() {
            return Array.from(lista.querySelectorAll(".card-projeto")).filter(function (c) { return !c.classList.contains("card-oculto"); });
        }
        function atual() {
            if (!pontos) return;
            const cards = visiveis();
            const referencia = lista.getBoundingClientRect().left + 22;
            let melhor = 0;
            let menor = Infinity;
            cards.forEach(function (c, i) {
                const d = Math.abs(c.getBoundingClientRect().left - referencia);
                if (d < menor) { menor = d; melhor = i; }
            });
            Array.prototype.forEach.call(pontos.children, function (p, i) { p.classList.toggle("ativo", i === melhor); });
        }
        function montar() {
            if (!celular.matches) {
                if (pontos) pontos.hidden = true;
                quantos = -1;
                return;
            }
            const n = visiveis().length;
            if (!pontos) {
                pontos = document.createElement("div");
                pontos.className = "carrossel-pontos";
                pontos.setAttribute("aria-hidden", "true");
                lista.after(pontos);
            }
            pontos.hidden = n < 2;
            if (n !== quantos) {
                quantos = n;
                pontos.innerHTML = new Array(n + 1).join("<i></i>");
            }
            atual();
        }

        lista.addEventListener("scroll", function () {
            cancelAnimationFrame(quadro);
            quadro = requestAnimationFrame(atual);
        }, { passive: true });
        /* o filtro por tecnologia esconde e mostra cards: refaz os pontos quando a contagem muda */
        new MutationObserver(function () {
            cancelAnimationFrame(quadro);
            quadro = requestAnimationFrame(montar);
        }).observe(lista, { subtree: true, attributes: true, attributeFilter: ["class"] });
        celular.addEventListener("change", montar);
        montar();
    })();

    /* ---------- "Não abriu o WhatsApp?" perto de qualquer botão que leve pra lá ----------
       Só dá pra saber se o WhatsApp abriu de verdade olhando se a pessoa saiu da aba (o celular manda
       o navegador pra trás quando troca de app). Por isso: clicou num link/botão de WhatsApp, espera um
       tempinho; se a aba continuar na tela, provavelmente não abriu nada, e aparece um jeito de copiar
       a mensagem ou o número pra chamar por fora. Cobre tanto os links <a> (menu, orçamento, contato)
       quanto o botão da paleta de comandos, que abre com window.open em vez de um link de verdade. */
    (function avisoWhatsApp() {
        function dadosDoLink(href) {
            try {
                const url = new URL(href, location.href);
                const numero = url.pathname.replace(/\D+/g, "");
                if (!numero) return null;
                return { numero, texto: url.searchParams.get("text") || "" };
            } catch {
                return null;
            }
        }

        let painel = null;
        let timerFechar = null;

        function esconderAviso() {
            if (painel) painel.classList.remove("mostrar");
        }

        async function copiar(valor, mensagemOk) {
            try {
                await navigator.clipboard.writeText(valor);
                if (typeof mostrarToast === "function") mostrarToast(mensagemOk);
            } catch {
                if (typeof mostrarToast === "function") mostrarToast("Não foi possível copiar. Copie manualmente.");
            }
        }

        function mostrarAviso(dados) {
            if (!painel) {
                painel = document.createElement("div");
                painel.className = "aviso-whats";
                painel.setAttribute("role", "status");
                document.body.appendChild(painel);
            }
            painel.innerHTML = "";

            const fechar = document.createElement("button");
            fechar.type = "button";
            fechar.className = "aviso-whats-fechar";
            fechar.setAttribute("aria-label", "Fechar aviso");
            fechar.textContent = "✕";
            fechar.addEventListener("click", esconderAviso);

            const texto = document.createElement("p");
            texto.textContent = "O WhatsApp não abriu? Copie e me chame por lá.";

            const acoes = document.createElement("div");
            acoes.className = "aviso-whats-acoes";
            if (dados.texto) {
                const botaoMsg = document.createElement("button");
                botaoMsg.type = "button";
                botaoMsg.className = "botao botao-secundario";
                botaoMsg.textContent = "Copiar mensagem";
                botaoMsg.addEventListener("click", () => copiar(dados.texto, "Mensagem copiada!"));
                acoes.append(botaoMsg);
            }
            const botaoNum = document.createElement("button");
            botaoNum.type = "button";
            botaoNum.className = "botao botao-secundario";
            botaoNum.textContent = "Copiar número";
            botaoNum.addEventListener("click", () => copiar("+" + dados.numero, "Número copiado!"));
            acoes.append(botaoNum);

            painel.append(fechar, texto, acoes);
            requestAnimationFrame(() => painel.classList.add("mostrar"));
            clearTimeout(timerFechar);
            timerFechar = setTimeout(esconderAviso, 12000);
        }

        function vigiar(href) {
            const dados = dadosDoLink(href);
            if (!dados) return;
            // Olha só uma vez, no fim da espera: se cancelasse na hora em que a aba escondesse,
            // um instante de tela bloqueada ou uma notificação passageira já contaria como "abriu".
            setTimeout(() => {
                if (!document.hidden) mostrarAviso(dados);
            }, 2200);
        }

        document.addEventListener("click", (evento) => {
            const link = evento.target.closest('a[href*="wa.me"]');
            if (link) vigiar(link.href);
        });

        // A paleta de comandos (Ctrl+K) abre o WhatsApp com window.open, não com um link <a>.
        const abrirJanelaOriginal = window.open.bind(window);
        window.open = function (url, ...resto) {
            if (typeof url === "string" && url.includes("wa.me")) vigiar(url);
            return abrirJanelaOriginal(url, ...resto);
        };
    })();

    /* ---------- Puxar a demonstração pra baixo fecha ela (gesto comum de app no celular) ----------
       O botão Voltar do Android já fecha (outro recurso, mais acima); isso aqui é o gesto de arrastar,
       do jeito que WhatsApp/Instagram fazem com as próprias janelas. Só reage a toque (não a mouse) e
       começa a partir do cabeçalho da janela, pra não brigar com a rolagem do conteúdo lá dentro. */
    (function arrastarModal() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const overlay = document.getElementById("modalOverlay");
        const caixa = overlay ? overlay.querySelector(".modal-caixa") : null;
        const cabecalho = overlay ? overlay.querySelector(".modal-cabecalho") : null;
        const fechar = document.getElementById("modalFechar");
        if (!overlay || !caixa || !cabecalho || !fechar) return;

        const alca = document.createElement("div");
        alca.className = "modal-alca";
        alca.setAttribute("aria-hidden", "true");
        cabecalho.prepend(alca);

        let inicioY = 0;
        let arrastando = false;
        let deslocamento = 0;

        function comecar(evento) {
            if (evento.pointerType !== "touch" || evento.target.closest("button")) return;
            inicioY = evento.clientY;
            arrastando = true;
            caixa.style.transition = "none";
        }
        function mover(evento) {
            if (!arrastando) return;
            deslocamento = Math.max(0, evento.clientY - inicioY);
            caixa.style.transform = `translateY(${deslocamento}px)`;
            overlay.style.background = deslocamento ? `rgba(10,5,20,${Math.max(.2, .78 - deslocamento / 400)})` : "";
        }
        function soltar() {
            if (!arrastando) return;
            arrastando = false;
            caixa.style.transition = "";
            overlay.style.background = "";
            const fechou = deslocamento > 110;
            deslocamento = 0;
            if (fechou) fechar.click();
            else caixa.style.transform = "";
        }
        cabecalho.addEventListener("pointerdown", comecar);
        cabecalho.addEventListener("pointermove", mover);
        cabecalho.addEventListener("pointerup", soltar);
        cabecalho.addEventListener("pointercancel", soltar);
        // Se a janela fechar por outro caminho (X, Esc, fundo) ou abrir de novo, não pode sobrar arrasto preso.
        new MutationObserver(() => {
            caixa.style.transform = "";
            caixa.style.transition = "";
            overlay.style.background = "";
        }).observe(overlay, { attributes: true, attributeFilter: ["hidden"] });
    })();

    /* ---------- Detalhes pequenos ---------- */

    /* Cumprimento pelo horário na linha do nome, em vez de "Olá" fixo. Sem JS, "Olá" continua aí. */
    (function saudacao() {
        const linha = document.querySelector(".hero-ola");
        const primeiroTexto = linha ? linha.firstChild : null;
        if (!primeiroTexto || primeiroTexto.nodeType !== Node.TEXT_NODE || !primeiroTexto.textContent.startsWith("Olá")) return;
        const hora = new Date().getHours();
        const cumprimento = hora < 6 ? "Boa madrugada" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
        primeiroTexto.textContent = primeiroTexto.textContent.replace("Olá", cumprimento);
    })();

    /* ---------- Braimstorm "melhorar os pixels da foto" (2026-09-23), os 5 escolhidos ----------
       A profundidade (pixel mais "perto" se mexe mais que o mais "longe") é só CSS: cada .pixel já
       lê --parallax/--parallax-x do .hero-conteudo (são custom properties, herdam sozinhas) e
       multiplica pelo --p de cada um. As outras 4 precisam de um empurrão de JS. */

    /* 1) Paleta muda com a hora do dia (mais quente de dia, mais viva à noite) */
    (function periodoPixels() {
        const hora = new Date().getHours();
        document.body.classList.add(hora >= 6 && hora < 18 ? "periodo-dia" : "periodo-noite");
    })();

    /* 2) Pixel perto do cursor brilha mais forte (só em tela com mouse de verdade) */
    (function realcePixels() {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const heroConteudo = document.querySelector(".hero-conteudo");
        const pixels = document.querySelectorAll(".campo-pixels .pixel");
        if (!heroConteudo || !pixels.length) return;
        let quadro = 0;
        heroConteudo.addEventListener("mousemove", (evento) => {
            cancelAnimationFrame(quadro);
            quadro = requestAnimationFrame(() => {
                pixels.forEach((pixel) => {
                    const rect = pixel.getBoundingClientRect();
                    const dist = Math.hypot(evento.clientX - (rect.left + rect.width / 2), evento.clientY - (rect.top + rect.height / 2));
                    pixel.style.setProperty("--realce", Math.max(0, 1 - dist / 90).toFixed(2));
                });
            });
        });
        heroConteudo.addEventListener("mouseleave", () => {
            pixels.forEach((pixel) => pixel.style.setProperty("--realce", 0));
        });
    })();

    /* 3) De vez em quando um pixel some e nasce em outro lugar — constelação viva, não fixa */
    (function embaralharPixels() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const pixels = document.querySelectorAll(".campo-pixels .pixel");
        if (!pixels.length) return;
        const letras = ["a", "b", "c", "d"];
        function embaralharUm() {
            const alvo = pixels[Math.floor(Math.random() * pixels.length)];
            alvo.classList.add("pixel-trocando");
            setTimeout(() => {
                const angulo = Math.random() * Math.PI * 2;
                const raio = 30 + Math.random() * 18;
                alvo.style.setProperty("--x", (50 + Math.cos(angulo) * raio).toFixed(1) + "%");
                alvo.style.setProperty("--y", (50 + Math.sin(angulo) * raio).toFixed(1) + "%");
                alvo.style.setProperty("--c", "var(--pixel-cor-" + letras[Math.floor(Math.random() * 4)] + ")");
                requestAnimationFrame(() => alvo.classList.remove("pixel-trocando"));
            }, 650);
            setTimeout(embaralharUm, 5000 + Math.random() * 4000);
        }
        setTimeout(embaralharUm, 5000 + Math.random() * 4000);
    })();

    /* 4) Estrela cadente rara cruzando perto da foto — um easter egg discreto */
    (function estrelaCadente() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const campo = document.querySelector(".campo-pixels");
        if (!campo) return;
        function cair() {
            if (!document.hidden) {
                const estrela = document.createElement("i");
                estrela.className = "estrela-cadente";
                estrela.style.setProperty("--ang", (18 + Math.random() * 24) + "deg");
                estrela.style.setProperty("--x", (56 + Math.random() * 12) + "%");
                estrela.style.setProperty("--y", (6 + Math.random() * 16) + "%");
                campo.appendChild(estrela);
                estrela.addEventListener("animationend", () => estrela.remove());
            }
            setTimeout(cair, 22000 + Math.random() * 14000);
        }
        setTimeout(cair, 22000 + Math.random() * 14000);
    })();

    /* Link direto pra uma pergunta do FAQ (ex.: #faq-prazo) também abre ela — :target só destaca, não abre. */
    (function abrirFaqDoLink() {
        function abrirDoHash() {
            if (!location.hash) return;
            try {
                const alvo = document.querySelector(`.faq-item${location.hash}`);
                if (alvo) alvo.open = true;
            } catch { /* link com # esquisito: ignora, sem quebrar a página */ }
        }
        abrirDoHash();
        window.addEventListener("hashchange", abrirDoHash);
    })();

    /* Relógio de Campo Grande - MS perto do WhatsApp, pra quem é de longe saber se é hora de gente acordada. */
    (function relogioContato() {
        const acoes = document.querySelector(".contato-acoes");
        if (!acoes || typeof Intl === "undefined") return;
        const p = document.createElement("p");
        p.className = "contato-relogio";
        acoes.after(p);
        let formatador;
        try {
            formatador = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Campo_Grande", hour: "2-digit", minute: "2-digit" });
        } catch { return; } // fuso não suportado neste navegador: sem relógio, sem quebrar nada
        function atualizar() { p.textContent = `🕒 Agora em Campo Grande - MS: ${formatador.format(new Date())}`; }
        atualizar();
        setInterval(atualizar, 30000);
    })();

    /* Tema pelo nascer/pôr do sol real de Campo Grande — só refina o palpite por horário fixo que já
       está na tela (7h-18h), sem mexer se a pessoa já escolheu um tema ou se o celular tem preferência. */
    (function temaPeloSol() {
        if (typeof lerTemaSalvo !== "function" || typeof atualizarTema !== "function" || lerTemaSalvo()) return;
        if (typeof modoEscuroDoSistema !== "undefined" && modoEscuroDoSistema && modoEscuroDoSistema.matches) return;
        const hoje = new Date().toISOString().slice(0, 10);
        const CHAVE = "sol-campo-grande";
        function aplicar(nascer, poeSol) {
            if (lerTemaSalvo()) return; // pode ter escolhido manualmente enquanto isso carregava
            atualizarTema(Date.now() >= nascer && Date.now() < poeSol);
        }
        let salvo = null;
        try { salvo = JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch { /* sem armazenamento */ }
        if (salvo && salvo.dia === hoje) { aplicar(salvo.nascer, salvo.poeSol); return; }
        fetch("https://api.sunrise-sunset.org/json?lat=-20.4697&lng=-54.6201&formatted=0")
            .then((r) => r.json())
            .then((dados) => {
                if (dados.status !== "OK") return;
                const nascer = new Date(dados.results.sunrise).getTime();
                const poeSol = new Date(dados.results.sunset).getTime();
                try { localStorage.setItem(CHAVE, JSON.stringify({ dia: hoje, nascer, poeSol })); } catch { /* sem armazenamento: busca de novo na próxima visita */ }
                aplicar(nascer, poeSol);
            })
            .catch(() => { /* sem internet ou serviço fora do ar: mantém o palpite por horário que já está na tela */ });
    })();

    /* "Você já me chamou" — pra quem volta depois de mandar um orçamento, um lembrete com o link direto. */
    (function jaChamou() {
        const CHAVE = "orcamento-enviado";
        function registrar() {
            try { localStorage.setItem(CHAVE, String(Date.now())); } catch { /* sem armazenamento: só não lembra na próxima visita */ }
        }
        document.addEventListener("click", (evento) => {
            if (evento.target.closest('.orc-acoes a[href*="wa.me"]')) registrar();
        });

        const contato = document.getElementById("contato");
        let quando = null;
        try { quando = Number(localStorage.getItem(CHAVE)) || null; } catch { /* sem armazenamento */ }
        if (!contato || !quando) return;
        const DIAS_30 = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - quando > DIAS_30) return;
        const link = contato.querySelector('a[href*="wa.me"]');
        if (!link) return;
        const data = new Date(quando).toLocaleDateString("pt-BR");
        const aviso = document.createElement("div");
        aviso.className = "aviso-ja-chamou";
        aviso.innerHTML = `<span>Você já me chamou em ${data}. <a href="${link.href}" target="_blank" rel="noopener noreferrer">Continuar a conversa</a></span>`;
        const fechar = document.createElement("button");
        fechar.type = "button";
        fechar.setAttribute("aria-label", "Fechar aviso");
        fechar.textContent = "✕";
        fechar.addEventListener("click", () => aviso.remove());
        aviso.append(fechar);
        contato.prepend(aviso);
    })();

    /* Confete simples ao chegar na mensagem pronta do orçamento — sem canvas nem biblioteca. */
    (function confeteOrcamento() {
        const raiz = document.getElementById("orcamentoApp");
        if (!raiz || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let ultimaVez = 0;
        function estourar() {
            const agora = Date.now();
            if (agora - ultimaVez < 4000) return;
            ultimaVez = agora;
            const cores = ["var(--cyan)", "var(--violet)", "var(--pink)"];
            for (let i = 0; i < 24; i++) {
                const pedaco = document.createElement("i");
                pedaco.className = "confete";
                pedaco.style.left = (Math.random() * 100) + "vw";
                pedaco.style.background = cores[i % cores.length];
                pedaco.style.animation = `cair-confete ${(1.6 + Math.random() * .9).toFixed(2)}s ease-in ${(Math.random() * .3).toFixed(2)}s forwards`;
                document.body.appendChild(pedaco);
                pedaco.addEventListener("animationend", () => pedaco.remove());
            }
        }
        new MutationObserver((mutacoes) => {
            for (const m of mutacoes) {
                for (const no of m.addedNodes) {
                    if (no.nodeType === 1 && (no.matches?.(".orc-mensagem") || no.querySelector?.(".orc-mensagem"))) { estourar(); return; }
                }
            }
        }).observe(raiz, { childList: true, subtree: true });
    })();

    /* Painel de atalhos escondidos (tecla "?") — Konami não entra na lista de propósito. */
    (function painelAtalhos() {
        const overlay = document.createElement("div");
        overlay.className = "atalhos-overlay";
        overlay.id = "atalhosOverlay";
        overlay.hidden = true;
        overlay.innerHTML = `<div class="atalhos-caixa" role="dialog" aria-modal="true" aria-labelledby="atalhosTitulo">
            <h3 id="atalhosTitulo">Atalhos do site</h3>
            <dl>
                <dt>Ctrl+K</dt><dd>Abre a busca de comandos</dd>
                <dt>Esc</dt><dd>Fecha o que estiver aberto</dd>
                <dt>?</dt><dd>Mostra este painel</dd>
                <dt>↑ no terminal</dt><dd>Repete o último comando</dd>
            </dl>
            <button type="button" class="botao botao-secundario atalhos-fechar">Fechar</button>
        </div>`;
        document.body.append(overlay);
        let focoAntes = null;
        function abrir() {
            focoAntes = document.activeElement;
            overlay.hidden = false;
            overlay.querySelector(".atalhos-fechar").focus();
        }
        function fechar() {
            overlay.hidden = true;
            if (focoAntes) focoAntes.focus();
        }
        overlay.querySelector(".atalhos-fechar").addEventListener("click", fechar);
        overlay.addEventListener("click", (evento) => { if (evento.target === overlay) fechar(); });
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !overlay.hidden) { fechar(); return; }
            if (evento.key !== "?" || overlay.hidden === false) return;
            const alvo = evento.target;
            if (alvo?.matches?.("input, textarea, [contenteditable]")) return;
            abrir();
        });
    })();

    /* Lembra o filtro de tecnologia escolhido (celular ou computador) e reabre o site já filtrado. */
    (function lembrarFiltro() {
        if (typeof chipsFiltro === "undefined" || !chipsFiltro.length) return;
        const CHAVE = "filtro-projetos";
        chipsFiltro.forEach((chip) => {
            chip.addEventListener("click", () => {
                try { localStorage.setItem(CHAVE, chip.dataset.filtro || "todos"); } catch { /* sem armazenamento */ }
            });
        });
        let salvo = null;
        try { salvo = localStorage.getItem(CHAVE); } catch { /* sem armazenamento */ }
        if (!salvo || salvo === "todos") return;
        const chip = Array.from(chipsFiltro).find((c) => c.dataset.filtro === salvo);
        if (chip) chip.click();
    })();

    /* Pré-carrega a demonstração ao passar o mouse/dedo no card por um instante (só liga no Wi-Fi/4G bom). */
    (function preCarregarDemo() {
        const conexao = navigator.connection;
        if (conexao && (conexao.saveData || /(^|-)(2g|3g)$/.test(conexao.effectiveType || ""))) return;
        const jaFeitos = new Set();
        function preCarregar(caminho) {
            if (!caminho || caminho.startsWith("http") || jaFeitos.has(caminho)) return;
            jaFeitos.add(caminho);
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.href = caminho;
            document.head.appendChild(link);
        }
        document.querySelectorAll(".card-projeto [data-demo]").forEach((botao) => {
            let temporizador = null;
            const caminho = botao.getAttribute("data-demo");
            const iniciar = () => { temporizador = setTimeout(() => preCarregar(caminho), 300); };
            const cancelar = () => clearTimeout(temporizador);
            botao.addEventListener("mouseenter", iniciar);
            botao.addEventListener("mouseleave", cancelar);
            botao.addEventListener("focus", iniciar);
            botao.addEventListener("blur", cancelar);
            botao.addEventListener("touchstart", iniciar, { passive: true });
        });
    })();

    /* Segundo segredo no terminal, além do Konami code. */
    (function segundoSegredoTerminal() {
        if (typeof comandosTerminal === "undefined") return;
        comandosTerminal.cafe = comandosTerminal["café"] = () => "☕ Bom café é metade do código. Valeu por bisbilhotar o terminal!";
    })();

    /* Vibração bem curta ao escolher uma opção no orçamento (celular Android; iPhone ignora sozinho). */
    (function vibrarNaEscolha() {
        if (!("vibrate" in navigator) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        document.addEventListener("click", (evento) => {
            if (evento.target.closest(".orc-opcao")) {
                try { navigator.vibrate(12); } catch { /* alguns navegadores negam sem gesto recente: sem problema, é só um extra */ }
            }
        });
    })();

    /* ---------- Braimstorm de CSS/JS (2026-09-22, parte 2) ---------- */

    /* Indicador deslizante atrás do chip de filtro ativo. */
    (function indicadorFiltro() {
        if (typeof chipsFiltro === "undefined" || chipsFiltro.length < 2) return;
        const grupo = document.querySelector(".filtros-projetos");
        if (!grupo) return;
        const indicador = document.createElement("span");
        indicador.className = "chip-indicador";
        indicador.setAttribute("aria-hidden", "true");
        grupo.prepend(indicador);
        function mover() {
            const ativo = grupo.querySelector(".chip-filtro.is-ativo");
            if (!ativo) { indicador.style.opacity = "0"; return; }
            indicador.style.opacity = "1";
            indicador.style.width = ativo.offsetWidth + "px";
            indicador.style.height = ativo.offsetHeight + "px";
            indicador.style.transform = `translate(${ativo.offsetLeft}px, ${ativo.offsetTop}px)`;
        }
        chipsFiltro.forEach((chip) => chip.addEventListener("click", () => requestAnimationFrame(mover)));
        window.addEventListener("resize", () => requestAnimationFrame(mover));
        mover();
    })();

    /* Sombra nas bordas do carrossel de projetos no celular, avisando que dá pra arrastar mais. */
    (function sombraCarrossel() {
        const lista = document.querySelector("#lista-projetos .destaques") || document.getElementById("lista-projetos");
        if (!lista) return;
        let quadro = 0;
        function atualizar() {
            lista.classList.toggle("sombra-esq", lista.scrollLeft > 4);
            lista.classList.toggle("sombra-dir", lista.scrollLeft < lista.scrollWidth - lista.clientWidth - 4);
        }
        lista.addEventListener("scroll", () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(atualizar); }, { passive: true });
        new MutationObserver(() => requestAnimationFrame(atualizar)).observe(lista, { subtree: true, attributes: true, attributeFilter: ["class"] });
        window.addEventListener("resize", () => requestAnimationFrame(atualizar));
        atualizar();
    })();

    /* Anel de progresso de leitura ao redor do botão "voltar ao topo". */
    (function anelTopo() {
        const botao = document.querySelector(".voltar-topo");
        if (!botao) return;
        const svgNS = "http://www.w3.org/2000/svg";
        const raio = 20;
        const circunferencia = 2 * Math.PI * raio;
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "anel-topo-progresso");
        svg.setAttribute("viewBox", "0 0 44 44");
        svg.setAttribute("aria-hidden", "true");
        const trilho = document.createElementNS(svgNS, "circle");
        trilho.setAttribute("cx", "22");
        trilho.setAttribute("cy", "22");
        trilho.setAttribute("r", String(raio));
        trilho.setAttribute("class", "anel-trilho");
        const barra = document.createElementNS(svgNS, "circle");
        barra.setAttribute("cx", "22");
        barra.setAttribute("cy", "22");
        barra.setAttribute("r", String(raio));
        barra.setAttribute("class", "anel-barra");
        barra.style.strokeDasharray = String(circunferencia);
        barra.style.strokeDashoffset = String(circunferencia);
        svg.append(trilho, barra);
        botao.prepend(svg);

        let quadro = 0;
        function atualizar() {
            const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = alturaTotal > 0 ? Math.min(1, Math.max(0, window.scrollY / alturaTotal)) : 0;
            barra.style.strokeDashoffset = String(circunferencia * (1 - progresso));
        }
        window.addEventListener("scroll", () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(atualizar); }, { passive: true });
        window.addEventListener("resize", () => requestAnimationFrame(atualizar));
        atualizar();
    })();

    /* Estrelas e forks somados dos repositórios, perto do total de contribuições. O número vem de
       script.js (reaproveita a mesma busca do "trabalhando agora em", sem gastar outra chamada). */
    (function estrelasGithub() {
        const alvo = document.querySelector(".gh-cab");
        if (!alvo) return;
        function mostrar(estrelas, forks) {
            let el = document.getElementById("ghEstrelas");
            if (!el) {
                el = document.createElement("span");
                el.id = "ghEstrelas";
                el.className = "gh-estrelas";
                alvo.append(el);
            }
            el.textContent = `⭐ ${estrelas} · 🍴 ${forks}`;
        }
        window.mostrarEstrelasGithub = mostrar;
        try {
            const salvo = JSON.parse(localStorage.getItem("gh-estrelas-v1") || "null");
            if (salvo && typeof salvo.estrelas === "number") mostrar(salvo.estrelas, salvo.forks || 0);
        } catch { /* sem armazenamento */ }
    })();

    /* Navegar os cards de projeto com as setas do teclado, quando um link do card está focado. */
    (function navegarCartoesTeclado() {
        const lista = document.getElementById("lista-projetos");
        if (!lista) return;
        function cartoesVisiveis() {
            return Array.from(lista.querySelectorAll(".card-projeto")).filter((c) => !c.classList.contains("card-oculto"));
        }
        lista.addEventListener("keydown", (evento) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(evento.key)) return;
            const cartao = evento.target.closest(".card-projeto");
            if (!cartao) return;
            const cartoes = cartoesVisiveis();
            const indice = cartoes.indexOf(cartao);
            if (indice === -1) return;
            let alvo = null;
            if (evento.key === "ArrowRight") alvo = cartoes[indice + 1];
            else if (evento.key === "ArrowLeft") alvo = cartoes[indice - 1];
            else if (evento.key === "Home") alvo = cartoes[0];
            else if (evento.key === "End") alvo = cartoes[cartoes.length - 1];
            if (!alvo) return;
            evento.preventDefault();
            const focavel = alvo.querySelector(".link-projeto") || alvo.querySelector("a, button");
            focavel?.focus();
            alvo.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "center" });
        });
    })();

    /* Botão próprio de instalar o site como app: aparece no rodapé só quando o navegador oferece. */
    (function instalarApp() {
        let evento = null;
        let botao = null;
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            evento = e;
            if (botao) { botao.hidden = false; return; }
            const footer = document.querySelector("footer");
            if (!footer) return;
            botao = document.createElement("button");
            botao.type = "button";
            botao.className = "link-rodape link-instalar";
            botao.textContent = "📲 Instalar no celular";
            botao.addEventListener("click", async () => {
                if (!evento) return;
                evento.prompt();
                await evento.userChoice;
                botao.hidden = true;
                evento = null;
            });
            footer.append(" · ", botao);
        });
        window.addEventListener("appinstalled", () => { if (botao) botao.hidden = true; });
    })();

    /* Baixar o portfólio inteiro em PDF (todos os projetos), pela caixa de impressão do navegador. */
    (function baixarPortfolioPdf() {
        const botoes = document.querySelectorAll("[data-baixar-portfolio]");
        if (!botoes.length) return;
        const impresso = document.createElement("div");
        impresso.className = "portfolio-impresso";
        impresso.setAttribute("aria-hidden", "true");
        document.body.append(impresso);

        function montar() {
            const partes = [
                "<h1>Portfólio — Samuel Mickael</h1>",
                `<p>${location.origin}${location.pathname}</p>`,
                "<ol>"
            ];
            document.querySelectorAll(".card-projeto").forEach((card) => {
                const nome = (card.querySelector(".projeto-nome") || card.querySelector("h3"))?.textContent.trim() || "";
                const desc = (card.querySelector(".projeto-resumo") || card.querySelector(".card-conteudo p:not(.tag)"))?.textContent.trim() || "";
                const link = card.querySelector(".link-projeto")?.href || "";
                partes.push(`<li><strong>${nome}</strong><br>${desc}${link ? `<br><small>${link}</small>` : ""}</li>`);
            });
            document.querySelectorAll(".mini-projeto").forEach((a) => {
                const nome = a.querySelector(".mini-projeto-nome")?.textContent.trim() || "";
                const tag = a.querySelector(".mini-projeto-tag")?.textContent.trim() || "";
                partes.push(`<li><strong>${nome}</strong><br>${tag}<br><small>${a.href}</small></li>`);
            });
            partes.push("</ol>");
            impresso.innerHTML = partes.join("");
        }

        botoes.forEach((botao) => botao.addEventListener("click", () => {
            montar();
            document.body.classList.add("imprimindo-portfolio");
            window.print();
        }));
        window.addEventListener("afterprint", () => document.body.classList.remove("imprimindo-portfolio"));
    })();

    /* Desligar animações manualmente, direto no painel de atalhos (tecla "?"). */
    (function opcaoSemAnimacoes() {
        const overlay = document.getElementById("atalhosOverlay");
        const fechar = overlay?.querySelector(".atalhos-fechar");
        if (!overlay || !fechar) return;
        const rotulo = document.createElement("label");
        rotulo.className = "atalhos-opcao";
        const caixa = document.createElement("input");
        caixa.type = "checkbox";
        caixa.id = "semAnimacoesCaixa";
        rotulo.append(caixa, " Desligar animações do site");
        fechar.before(rotulo);
        try { caixa.checked = localStorage.getItem("sem-animacoes") === "1"; } catch { /* sem armazenamento */ }
        document.documentElement.classList.toggle("sem-animacoes", caixa.checked);
        caixa.addEventListener("change", () => {
            document.documentElement.classList.toggle("sem-animacoes", caixa.checked);
            try { localStorage.setItem("sem-animacoes", caixa.checked ? "1" : "0"); } catch { /* sem armazenamento: vale só nesta visita */ }
        });
    })();

    /* ---------- Braimstorm de CSS/JS (2026-09-23, parte 3) ---------- */

    /* Dados estruturados (JSON-LD) dos projetos, montados a partir dos cards da própria página.
       Antes era uma lista fixa no <head> e ficava desatualizada toda vez que um projeto entrava ou
       saía (foi assim que reparei: faltavam a Fatia Nobre e a Conta a Dois). Agora nunca mais fica. */
    (function dadosEstruturadosProjetos() {
        const itens = [];
        document.querySelectorAll(".card-projeto").forEach((card) => {
            const nome = (card.querySelector(".projeto-nome") || card.querySelector("h3"))?.textContent.trim();
            const url = card.querySelector(".link-projeto")?.href;
            if (!nome || !url) return;
            itens.push({
                nome,
                desc: (card.querySelector(".projeto-resumo") || card.querySelector(".card-conteudo p:not(.tag)"))?.textContent.trim() || "",
                url,
                categoria: card.dataset.schemaCategoria || "WebApplication",
                sistema: card.dataset.schemaOs || "Web",
            });
        });
        document.querySelectorAll(".mini-projeto").forEach((a) => {
            const nome = a.querySelector(".mini-projeto-nome")?.textContent.trim();
            if (!nome || !a.href) return;
            itens.push({
                nome,
                desc: a.querySelector(".mini-projeto-desc")?.textContent.trim() || "",
                url: a.href,
                categoria: a.dataset.schemaCategoria || "WebApplication",
                sistema: a.dataset.schemaOs || "Web",
            });
        });
        if (!itens.length) return;

        const lista = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: itens.map((item, indice) => ({
                "@type": "ListItem",
                position: indice + 1,
                item: {
                    "@type": "SoftwareApplication",
                    name: item.nome,
                    description: item.desc,
                    url: item.url,
                    applicationCategory: item.categoria,
                    operatingSystem: item.sistema,
                },
            })),
        };
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(lista);
        document.head.append(script);
    })();

    /* Brilho que segue o cursor: cards de projeto (o giro 3D já existia; isso é só o brilho), e agora
       também os links do menu, os cards de serviço e a caixa de orçamento. */
    (function brilhoCursorCards() {
        if (!window.matchMedia("(hover: hover)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        document.querySelectorAll(".card-projeto, .nav-links a, #servicos .lista-servicos article, .orcamento-caixa").forEach((alvo) => {
            alvo.addEventListener("mousemove", (evento) => {
                const rect = alvo.getBoundingClientRect();
                alvo.style.setProperty("--brilho-x", ((evento.clientX - rect.left) / rect.width) * 100 + "%");
                alvo.style.setProperty("--brilho-y", ((evento.clientY - rect.top) / rect.height) * 100 + "%");
            });
        });
    })();

    /* Aviso discreto se a conexão cair no meio da visita, pra não parecer que o site travou. */
    (function avisoOffline() {
        if (!("onLine" in navigator)) return;
        let aviso = null;
        function mostrar() {
            if (aviso) return;
            aviso = document.createElement("div");
            aviso.className = "aviso-offline";
            aviso.setAttribute("role", "status");
            aviso.textContent = "📶 Sem conexão agora. O que já carregou continua funcionando.";
            document.body.append(aviso);
            requestAnimationFrame(() => aviso.classList.add("mostrar"));
        }
        function esconder() {
            if (!aviso) return;
            aviso.classList.remove("mostrar");
            const alvo = aviso;
            setTimeout(() => alvo.remove(), 300);
            aviso = null;
        }
        window.addEventListener("offline", mostrar);
        window.addEventListener("online", esconder);
        if (!navigator.onLine) mostrar();
    })();

    /* ---------- Cartões de projeto repaginados (2026-09-23) ---------- */

    /* Selo "Novo" nos projetos publicados há menos de 14 dias: sai sozinho, sem ninguém lembrar de tirar. */
    (function seloNovo() {
        const hoje = Date.now();
        document.querySelectorAll(".card-projeto[data-publicado]").forEach((card) => {
            const publicado = Date.parse(card.dataset.publicado + "T12:00:00");
            const dias = (hoje - publicado) / 86400000;
            if (!(dias >= 0 && dias < 14)) return;
            const selos = card.querySelector(".projeto-selos");
            if (!selos) return;
            const selo = document.createElement("span");
            selo.className = "selo-novo-projeto";
            selo.textContent = "Novo";
            selos.prepend(selo);
        });
    })();

    /* As prévias animadas (telas do celular trocando, balões do chat) só rodam com o card na tela.
       Fora dela ficam paradas: não gastam bateria de quem está lendo outra parte do site. */
    (function previasSoNaTela() {
        const cards = document.querySelectorAll(".card-projeto");
        if (!("IntersectionObserver" in window)) {
            cards.forEach((c) => c.classList.add("em-tela"));
            return;
        }
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((e) => e.target.classList.toggle("em-tela", e.isIntersecting));
        }, { threshold: 0.25 });
        cards.forEach((c) => observador.observe(c));
    })();

    /* Os cards entram um de cada vez, em vez de todos juntos. O atraso é tirado logo depois,
       senão o "levantar" do mouse em cima do card também ficaria atrasado. */
    (function entradaEmSequencia() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
        const cards = Array.from(document.querySelectorAll("#lista-projetos .card-projeto"));
        const observador = new IntersectionObserver((entradas) => {
            let ordem = 0;
            entradas.forEach((e) => {
                if (!e.isIntersecting) return;
                const card = e.target;
                observador.unobserve(card);
                card.style.transitionDelay = ordem * 110 + "ms";
                ordem++;
                setTimeout(() => { card.style.transitionDelay = ""; }, 900 + ordem * 110);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        cards.forEach((c) => observador.observe(c));
    })();
})();

/* Demo com o nome do negócio do visitante: o que for digitado vai como ?nome= pras demos que aceitam
   (loja e atendimento por chat), e os cards delas já mostram o nome. Fica guardado neste aparelho. */
(function () {
    "use strict";
    const campo = document.getElementById("nomeNegocio");
    const status = document.getElementById("nomeDemoStatus");
    if (!campo) return;
    const DEMOS = ["fatia-nobre/", "loja-cyberpunk/"];
    const CHAVE = "portfolio-nome-negocio";
    const TEXTO_INICIAL = status ? status.textContent : "";

    const links = [];
    document.querySelectorAll("a[href], [data-demo], [data-compartilhar]").forEach(function (el) {
        ["href", "data-demo"].forEach(function (attr) {
            const url = el.getAttribute(attr);
            if (url && DEMOS.some(function (d) { return url.indexOf(d) !== -1; })) links.push({ el: el, attr: attr, base: url.split("?")[0] });
        });
    });
    // Nome da marca que aparece no visual dos cards
    const rotulos = [
        { el: document.querySelector(".visual-loja .loja-logo"), maiusculo: true },
        { el: document.querySelector('[data-compartilhar="./fatia-nobre/index.html"]')?.closest(".projeto-visual")?.querySelector(".print-barra span"), maiusculo: false },
    ].filter(function (r) { return r.el; });
    rotulos.forEach(function (r) { r.original = r.el.textContent; });

    function aplicar(salvar) {
        const nome = campo.value.trim().slice(0, 40);
        links.forEach(function (l) { l.el.setAttribute(l.attr, nome ? l.base + "?nome=" + encodeURIComponent(nome) : l.base); });
        rotulos.forEach(function (r) { r.el.textContent = nome ? (r.maiusculo ? nome.toUpperCase() : nome) : r.original; });
        if (status) status.textContent = nome ? "Pronto! A loja e o atendimento por chat agora abrem como “" + nome + "”. Toque em Testar agora." : TEXTO_INICIAL;
        if (salvar) { try { nome ? localStorage.setItem(CHAVE, nome) : localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento: só não lembra */ } }
    }

    try { campo.value = localStorage.getItem(CHAVE) || ""; } catch (e) { /* segue vazio */ }
    if (campo.value) aplicar(false);
    let espera = 0;
    campo.addEventListener("input", function () { clearTimeout(espera); espera = setTimeout(function () { aplicar(true); }, 250); });
})();

/* Promoção com prazo: tudo que tem data-promo-ate="AAAA-MM-DD" aparece até o fim desse dia e some
   sozinho depois, pra oferta vencida não ficar no ar. Sem JS continua escondido (atributo hidden). */
(function () {
    "use strict";
    const agora = new Date();
    // e o contrário: data-promo-depois="AAAA-MM-DD" só aparece depois desse dia (o que vale quando a promoção acaba)
    document.querySelectorAll("[data-promo-depois]").forEach(function (el) {
        const inicio = new Date(el.getAttribute("data-promo-depois") + "T23:59:59");
        if (!isNaN(inicio) && agora > inicio) el.hidden = false;
    });
    document.querySelectorAll("[data-promo-ate]").forEach(function (el) {
        const fim = new Date(el.getAttribute("data-promo-ate") + "T23:59:59");
        if (!isNaN(fim) && agora <= fim) el.hidden = false;
    });
})();
