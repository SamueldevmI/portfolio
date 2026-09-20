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
            const cel = Math.max(11, Math.min(18, Math.floor((rolagem.clientWidth - 6 - (colunas - 1) * FOLGA) / colunas)));
            desenho.style.setProperty("--gh-cel", cel + "px");
        }

        function desenhar(dias, soma) {
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

            desenho.textContent = "";
            desenho.setAttribute("role", "img");
            desenho.setAttribute("aria-label", "Contribuições no GitHub de " + USUARIO + " nos últimos 12 meses: " + soma);
            desenho.appendChild(rolagem);
            desenho.appendChild(legenda);
            desenho.hidden = false;
            if (imagemAntiga) imagemAntiga.hidden = true;
            if (total) {
                total.innerHTML = "<b>" + soma + "</b> contribuições no último ano";
                total.hidden = false;
            }
            ajustar();
            rolagem.scrollLeft = rolagem.scrollWidth; // no celular começa pelo mais recente
        }

        fetch("https://github-contributions-api.jogruber.de/v4/" + USUARIO + "?y=last")
            .then(function (resposta) { return resposta.ok ? resposta.json() : Promise.reject(new Error("sem dados")); })
            .then(function (dados) {
                const dias = dados && dados.contributions;
                if (!Array.isArray(dias) || dias.length < 30) return;
                const soma = (dados.total && dados.total.lastYear) || dias.reduce(function (s, d) { return s + d.count; }, 0);
                desenhar(dias, soma);
            })
            .catch(function () { /* sem rede ou serviço fora do ar: fica a imagem de antes */ });

        let espera = 0;
        window.addEventListener("resize", function () {
            clearTimeout(espera);
            espera = setTimeout(ajustar, 120);
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
})();
