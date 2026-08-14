const botaoTema = document.getElementById("temaEscuro");

function atualizarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);
    botaoTema.setAttribute("aria-pressed", String(!escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema escuro" : "Ativar tema claro");
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

/* Toast de feedback */
const toastEl = document.getElementById("toast");
let toastTimeout;

function mostrarToast(mensagem) {
    if (!toastEl) return;
    toastEl.textContent = mensagem;
    toastEl.classList.add("mostrar");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove("mostrar"), 2600);
}

/* Terminal interativo */
const terminalForm = document.getElementById("terminalForm");
const terminalInput = document.getElementById("terminalInput");
const terminalSaida = document.getElementById("terminalSaida");

function imprimirNoTerminal(texto, classe) {
    const p = document.createElement("p");
    if (classe) p.className = classe;
    p.textContent = texto;
    terminalSaida.appendChild(p);
    terminalSaida.scrollTop = terminalSaida.scrollHeight;
}

const comandosTerminal = {
    help: () => "Comandos: whoami, skills, projetos, contato, clear",
    whoami: () => "Samuel Mickael — estudante de ADS (4º semestre), dev front-end & back-end. Buscando a primeira oportunidade em T.I.",
    skills: () => "Python · Flask · SQLAlchemy · JavaScript · HTML · CSS · Git · pytest",
    projetos() {
        document.getElementById("projetos").scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        return "Abrindo a seção de projetos ↓";
    },
    contato() {
        document.getElementById("contato").scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        return "Abrindo a seção de contato ↓";
    },
    clear() {
        terminalSaida.innerHTML = "";
        return null;
    },
};
comandosTerminal.projects = comandosTerminal.projetos;
comandosTerminal.contact = comandosTerminal.contato;
comandosTerminal.limpar = comandosTerminal.clear;

if (terminalForm) {
    terminalForm.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const valor = terminalInput.value.trim();
        if (!valor) return;
        imprimirNoTerminal("$ " + valor, "terminal-echo");
        const comando = comandosTerminal[valor.toLowerCase()];
        if (comando) {
            const resposta = comando();
            if (resposta) imprimirNoTerminal(resposta);
        } else {
            imprimirNoTerminal(`comando não encontrado: "${valor}". digite "help".`, "terminal-erro");
        }
        terminalInput.value = "";
    });
}

/* Filtro de projetos por tecnologia */
const chipsFiltro = document.querySelectorAll(".chip-filtro");
const cardsProjeto = document.querySelectorAll(".card-projeto");

chipsFiltro.forEach((chip) => {
    chip.addEventListener("click", () => {
        chipsFiltro.forEach((c) => c.classList.remove("is-ativo"));
        chip.classList.add("is-ativo");
        const filtro = chip.dataset.filtro;
        cardsProjeto.forEach((card) => {
            const tecnologias = (card.dataset.tecnologias || "").split(" ");
            const mostrar = filtro === "todos" || tecnologias.includes(filtro);
            card.classList.toggle("card-oculto", !mostrar);
        });
    });
});

/* Modal (demo embutida em iframe + case study em texto) */
const modalOverlay = document.getElementById("modalOverlay");
const modalTitulo = document.getElementById("modalTitulo");
const modalCorpo = document.getElementById("modalCorpo");
const modalFechar = document.getElementById("modalFechar");
let focoAntesDoModal = null;

function abrirModal(titulo, conteudoHtml) {
    modalTitulo.textContent = titulo;
    modalCorpo.innerHTML = conteudoHtml;
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    focoAntesDoModal = document.activeElement;
    modalFechar.focus();
}

function fecharModal() {
    modalOverlay.hidden = true;
    modalCorpo.innerHTML = "";
    document.body.style.overflow = "";
    if (focoAntesDoModal) focoAntesDoModal.focus();
}

if (modalOverlay) {
    modalFechar.addEventListener("click", fecharModal);
    modalOverlay.addEventListener("click", (evento) => {
        if (evento.target === modalOverlay) fecharModal();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !modalOverlay.hidden) fecharModal();
    });

    document.querySelectorAll("[data-demo]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const src = botao.getAttribute("data-demo");
            const titulo = botao.getAttribute("data-demo-titulo") || "Demonstração";
            abrirModal(titulo, `<iframe src="${src}" title="Demonstração — ${titulo}" loading="lazy"></iframe>`);
        });
    });

    document.querySelectorAll("[data-caso]").forEach((botao) => {
        botao.addEventListener("click", () => {
            abrirModal("Decisões técnicas — Controle de Gastos API", `
                <ul class="lista-decisoes">
                    <li><strong>Lógica de negócio separada da API.</strong> A camada que valida e salva um gasto não sabe nada sobre HTTP, JSON ou request — só recebe dados e devolve dados. Isso permitiu escrever os testes sem simular requisição nenhuma.</li>
                    <li><strong>CORS restrito.</strong> A API aceita chamadas só do domínio do portfólio, não "*" — um detalhe que mostra atenção a quem pode consumir a API.</li>
                    <li><strong>Validação com erro 400 claro.</strong> Se falta descrição ou o valor é negativo, a API explica o motivo em vez de deixar o banco quebrar sozinho.</li>
                    <li><strong>CI no GitHub Actions.</strong> A cada push, os testes automatizados rodam sozinhos antes de qualquer coisa ir pro ar.</li>
                </ul>
                <p class="modal-nota">Publicado originalmente como <a href="https://www.linkedin.com/in/samuelrondon-dev/" target="_blank" rel="noopener noreferrer">post no LinkedIn</a>.</p>
            `);
        });
    });
}

/* Copiar link do LinkedIn */
const botaoCopiarLink = document.getElementById("botaoCopiarLink");

botaoCopiarLink?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText("https://www.linkedin.com/in/samuelrondon-dev/");
        mostrarToast("Link do LinkedIn copiado!");
    } catch {
        mostrarToast("Não foi possível copiar. Copie manualmente.");
    }
});

/* Easter egg — código Konami */
const sequenciaKonami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
let progressoKonami = 0;

document.addEventListener("keydown", (evento) => {
    const tecla = evento.key.toLowerCase();
    if (tecla === sequenciaKonami[progressoKonami]) {
        progressoKonami++;
        if (progressoKonami === sequenciaKonami.length) {
            progressoKonami = 0;
            ativarEasterEgg();
        }
    } else {
        progressoKonami = tecla === sequenciaKonami[0] ? 1 : 0;
    }
});

function ativarEasterEgg() {
    mostrarToast("🕹️ Easter egg encontrado! Modo dev ativado.");
    if (prefereMenosMovimento) return;
    const emojis = ["💻", "🚀", "✨", "🐍", "⚡"];
    for (let i = 0; i < 24; i++) {
        const span = document.createElement("span");
        span.className = "confete";
        span.textContent = emojis[i % emojis.length];
        span.style.left = Math.random() * 100 + "vw";
        span.style.animationDuration = 2.4 + Math.random() * 1.6 + "s";
        span.style.animationDelay = Math.random() * 0.4 + "s";
        document.body.appendChild(span);
        span.addEventListener("animationend", () => span.remove());
    }
}
