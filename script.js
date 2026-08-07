const botaoTema = document.getElementById("temaEscuro");

function atualizarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);
    botaoTema.setAttribute("aria-pressed", String(escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
}

const temaSalvo = localStorage.getItem("tema");
atualizarTema(temaSalvo === "escuro");

botaoTema.addEventListener("click", () => {
    const escuro = !document.body.classList.contains("dark-mode");
    atualizarTema(escuro);
    localStorage.setItem("tema", escuro ? "escuro" : "claro");
});

document.getElementById("ano").textContent = new Date().getFullYear();

const elementosRevelar = document.querySelectorAll(".card-projeto, .lista-jornada article, .lista-servicos article");
const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

elementosRevelar.forEach((el) => el.classList.add("reveal"));

if (prefereMenosMovimento || !("IntersectionObserver" in window)) {
    elementosRevelar.forEach((el) => el.classList.add("is-visible"));
} else {
    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("is-visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elementosRevelar.forEach((el) => observador.observe(el));
}

const numerosContaveis = document.querySelectorAll("[data-contar]");

if (!prefereMenosMovimento) {
    const miniEuWrap = document.getElementById("miniEuWrap");
    const miniEu = document.getElementById("miniEu");
    const ponteiroFino = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

    if (miniEuWrap && miniEu && ponteiroFino) {
        const ctx = miniEu.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const paleta = {
            H: "#241811", // cabelo cacheado
            S: "#c9986f", // pele
            E: "#15100c", // olhos
            M: "#2a1c12", // cavanhaque
            C: "#5df4d0", // camiseta (cor do site)
            P: "#1c2740", // calça
            K: "#080a10", // sapato
        };

        const cabecaTorso = [
            "..............",
            "....HHHHHH....",
            "..HHHHHHHHHH..",
            ".HHHHHHHHHHHH.",
            ".HHSSSSSSSSHH.",
            ".HSSSSSSSSSSH.",
            ".HSSESSSSESSH.",
            ".HSSSSSSSSSSH.",
            ".HSSSMMMMSSSH.",
            ".HSSSSSSSSSSH.",
            "....SSSSSS....",
            "..SCCCCCCCCS..",
            "..SCCCCCCCCS..",
            "..SCCCCCCCCS..",
            "..SCCCCCCCCS..",
            "...CCCCCCCC...",
            "...PPPPPPPP...",
        ];
        const pernasParado = ["...PPP..PPP...", "...PPP..PPP...", "...PPP..PPP...", "...KKK..KKK..."];
        const pernasAndando = ["..PPPP..PPPP..", "..PPPP..PPPP..", "..PPPP..PPPP..", "..KKKK..KKKK.."];
        const quadroParado = [...cabecaTorso, ...pernasParado];
        const quadroAndando = [...cabecaTorso, ...pernasAndando];

        function desenhar(mapa) {
            ctx.clearRect(0, 0, 14, 21);
            mapa.forEach((linha, y) => {
                [...linha].forEach((cor, x) => {
                    if (cor === ".") return;
                    ctx.fillStyle = paleta[cor];
                    ctx.fillRect(x, y, 1, 1);
                });
            });
        }

        desenhar(quadroParado);

        // cada uma dessas "coisas do site" funciona como um obstáculo pro bonequinho escalar
        const obstaculos = document.querySelectorAll(
            ".card-projeto, .lista-jornada article, .lista-servicos article, .foto-wrapper, .contato, .hero-numeros"
        );

        let atualX = window.innerWidth - 130;
        let atualY = 40;
        let alvoX = atualX;
        let alvoY = atualY;
        let cansado = false;
        let quadroAtual = "parado";
        let ultimaTrocaQuadro = 0;

        function acharObstaculoAtual() {
            const linhaDeReferencia = window.innerHeight * 0.55;
            let melhor = null;
            let menorDistancia = Infinity;

            obstaculos.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) return;
                const centroEl = (rect.top + rect.bottom) / 2;
                const distancia = Math.abs(centroEl - linhaDeReferencia);
                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    melhor = rect;
                }
            });

            if (!melhor) return null;
            return {
                x: Math.min(Math.max(melhor.right - 60, 16), window.innerWidth - 128),
                y: melhor.top - 160,
            };
        }

        function animar(tempo) {
            const novoAlvo = acharObstaculoAtual();

            if (novoAlvo && !cansado) {
                const escaladaGrande = Math.abs(novoAlvo.y - alvoY) > 55;
                alvoX = novoAlvo.x;
                alvoY = novoAlvo.y;

                if (escaladaGrande) {
                    cansado = true;
                    miniEu.classList.add("escalando");
                    setTimeout(() => {
                        miniEu.classList.remove("escalando");
                        miniEu.classList.add("respirando");
                        setTimeout(() => {
                            miniEu.classList.remove("respirando");
                            cansado = false;
                        }, 1000);
                    }, 500);
                }
            }

            const dx = alvoX - atualX;
            const dy = alvoY - atualY;
            atualX += dx * 0.06;
            atualY += dy * 0.06;

            const emMovimento = Math.abs(dx) + Math.abs(dy) > 2;

            if (emMovimento && !cansado) {
                if (tempo - ultimaTrocaQuadro > 180) {
                    quadroAtual = quadroAtual === "parado" ? "andando" : "parado";
                    desenhar(quadroAtual === "parado" ? quadroParado : quadroAndando);
                    ultimaTrocaQuadro = tempo;
                }
            } else if (!cansado && quadroAtual !== "parado") {
                quadroAtual = "parado";
                desenhar(quadroParado);
            }

            miniEuWrap.style.transform = `translate(${atualX}px, ${atualY}px)`;
            requestAnimationFrame(animar);
        }

        requestAnimationFrame(animar);
    }

    numerosContaveis.forEach((el) => {
        const alvo = Number(el.dataset.contar);
        const sufixo = el.dataset.sufixo || "";
        const pad2 = el.dataset.formato === "pad2";
        const duracao = 1200;
        let inicio = null;

        function passo(tempo) {
            if (inicio === null) inicio = tempo;
            const progresso = Math.min((tempo - inicio) / duracao, 1);
            const facilitado = 1 - Math.pow(1 - progresso, 3);
            const valor = Math.round(alvo * facilitado);
            el.textContent = (pad2 ? String(valor).padStart(2, "0") : String(valor)) + sufixo;
            if (progresso < 1) requestAnimationFrame(passo);
        }

        requestAnimationFrame(passo);
    });
}
