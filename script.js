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
    const miniEu = document.getElementById("miniEu");
    const ponteiroFino = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

    if (miniEu && ponteiroFino) {
        const ctx = miniEu.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const paleta = {
            H: "#241811", // cabelo cacheado
            S: "#c9986f", // pele
            E: "#15100c", // olhos
            M: "#2a1c12", // cavanhaque
            D: "#0a0e1a", // contorno
            C: "#5df4d0", // camiseta (cor do site)
        };

        const mapa = [
            "................",
            ".....HHHHHH.....",
            "...HHHHHHHHHH...",
            "..HHHHHHHHHHHH..",
            "..HHSSSSSSSSHH..",
            "..HSSSSSSSSSSH..",
            "..HSSESSSSESSH..",
            "..HSSSSSSSSSSH..",
            "..HSSSMMMMSSSH..",
            "..HSSSSSSSSSSH..",
            "...DSSSSSSSSD...",
            "....DCCCCCCD....",
            "...DCCCCCCCCD...",
            "..DCCCCCCCCCCD..",
            ".DCCCCCCCCCCCCD.",
            "DCCCCCCCCCCCCCCD",
        ];

        mapa.forEach((linha, y) => {
            [...linha].forEach((cor, x) => {
                if (cor === ".") return;
                ctx.fillStyle = paleta[cor];
                ctx.fillRect(x, y, 1, 1);
            });
        });

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let posX = mouseX;
        let posY = mouseY;
        let visivel = false;

        window.addEventListener("mousemove", (evento) => {
            mouseX = evento.clientX;
            mouseY = evento.clientY;
            if (!visivel) {
                posX = mouseX;
                posY = mouseY;
                visivel = true;
                miniEu.style.opacity = "1";
            }
        });

        miniEu.style.opacity = "0";
        miniEu.style.transition = "opacity .3s ease";

        function seguir() {
            posX += (mouseX - posX) * 0.14;
            posY += (mouseY - posY) * 0.14;
            const balanco = Math.sin(Date.now() / 260) * 3;
            miniEu.style.transform = `translate(${posX + 16}px, ${posY + 16 + balanco}px)`;
            requestAnimationFrame(seguir);
        }

        requestAnimationFrame(seguir);
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
