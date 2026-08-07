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
        // cada uma dessas "coisas do site" funciona como um obstáculo pro bonequinho escalar
        const obstaculos = document.querySelectorAll(
            ".card-projeto, .lista-jornada article, .lista-servicos article, .foto-wrapper, .contato, .hero-numeros"
        );

        let atualX = window.innerWidth - 140;
        let atualY = 30;
        let alvoX = atualX;
        let alvoY = atualY;
        let cansado = false;
        let andandoAtivo = false;

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
                x: Math.min(Math.max(melhor.right - 90, 16), window.innerWidth - 100),
                y: melhor.top - 138,
            };
        }

        function animar() {
            const novoAlvo = acharObstaculoAtual();

            if (novoAlvo && !cansado) {
                const escaladaGrande = Math.abs(novoAlvo.y - alvoY) > 55;
                alvoX = novoAlvo.x;
                alvoY = novoAlvo.y;

                if (escaladaGrande) {
                    cansado = true;
                    miniEu.classList.remove("andando");
                    andandoAtivo = false;
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

            if (emMovimento && !cansado && !andandoAtivo) {
                miniEu.classList.add("andando");
                andandoAtivo = true;
            } else if ((!emMovimento || cansado) && andandoAtivo) {
                miniEu.classList.remove("andando");
                andandoAtivo = false;
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
