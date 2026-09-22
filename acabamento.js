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
        const lista = document.getElementById("lista-projetos");
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
            pontos.hidden = false;
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

    /* Cumprimento pelo horário no título do início, em vez de "Olá" fixo. Sem JS, "Olá" continua aí. */
    (function saudacao() {
        const h1 = document.querySelector(".hero-conteudo h1");
        const primeiroTexto = h1 ? h1.firstChild : null;
        if (!primeiroTexto || primeiroTexto.nodeType !== Node.TEXT_NODE || !primeiroTexto.textContent.startsWith("Olá")) return;
        const hora = new Date().getHours();
        const cumprimento = hora < 6 ? "Boa madrugada" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
        primeiroTexto.textContent = primeiroTexto.textContent.replace("Olá", cumprimento);
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
})();
