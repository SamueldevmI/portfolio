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

/* Barra de progresso de leitura */
const barraProgresso = document.getElementById("barraProgresso");

function atualizarBarraProgresso() {
    if (!barraProgresso) return;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    barraProgresso.style.width = progresso + "%";
}

let ticandoBarra = false;
window.addEventListener("scroll", () => {
    if (ticandoBarra) return;
    ticandoBarra = true;
    requestAnimationFrame(() => {
        atualizarBarraProgresso();
        ticandoBarra = false;
    });
});
atualizarBarraProgresso();

/* Stats do hero "ao vivo" (GitHub API, com fallback silencioso pros valores estáticos) */
function atualizarStatAoVivo(elemento, valor, formato) {
    if (!elemento) return;
    const texto = formato === "pad2" ? String(valor).padStart(2, "0") : String(valor);
    if (elemento.textContent === texto) return;
    elemento.textContent = texto;
    elemento.dataset.contar = String(valor);
    if (!prefereMenosMovimento) {
        elemento.classList.remove("stat-atualizado");
        void elemento.offsetWidth;
        elemento.classList.add("stat-atualizado");
    }
}

async function carregarStatsGithub() {
    try {
        const resposta = await fetch("https://api.github.com/users/SamueldevmI/repos?per_page=100&type=owner");
        if (!resposta.ok) return;
        const repos = await resposta.json();
        if (!Array.isArray(repos)) return;
        const totalRepos = repos.filter((r) => !r.fork).length;
        const linguagens = new Set(repos.map((r) => r.language).filter(Boolean));
        // Espera a contagem inicial (1200ms) terminar antes de atualizar, senão a animação estática sobrescreve o valor ao vivo.
        if (!prefereMenosMovimento) await new Promise((resolve) => setTimeout(resolve, 1250));
        if (totalRepos > 0) atualizarStatAoVivo(document.getElementById("statProjetos"), totalRepos, "pad2");
        if (linguagens.size > 0) atualizarStatAoVivo(document.getElementById("statTecnologias"), linguagens.size, "pad2");
    } catch {
        /* API do GitHub indisponível ou limite de requisições atingido: mantém os números estáticos do HTML */
    }
}
carregarStatsGithub();

/* Cross-highlight: passar o mouse numa competência destaca os projetos relacionados */
const habilidadesItens = document.querySelectorAll(".habilidades li[data-tecnologia]");
const listaProjetosEl = document.getElementById("lista-projetos");

function destacarProjetosPorTecnologia(tecnologia) {
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.add("tem-destaque");
    cardsProjeto.forEach((card) => {
        const tecnologias = (card.dataset.tecnologias || "").split(" ");
        card.classList.toggle("card-destacado", tecnologias.includes(tecnologia));
    });
}

function limparDestaqueProjetos() {
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.remove("tem-destaque");
    cardsProjeto.forEach((card) => card.classList.remove("card-destacado"));
}

habilidadesItens.forEach((item) => {
    item.addEventListener("mouseenter", () => destacarProjetosPorTecnologia(item.dataset.tecnologia));
    item.addEventListener("mouseleave", limparDestaqueProjetos);
    item.addEventListener("focus", () => destacarProjetosPorTecnologia(item.dataset.tecnologia));
    item.addEventListener("blur", limparDestaqueProjetos);
});

/* Compartilhar projeto (Web Share API, com fallback pra copiar o link) */
document.querySelectorAll("[data-compartilhar]").forEach((botao) => {
    botao.addEventListener("click", async (evento) => {
        evento.stopPropagation();
        const caminho = botao.getAttribute("data-compartilhar");
        const titulo = botao.getAttribute("data-compartilhar-titulo") || "Projeto";
        const url = new URL(caminho, window.location.href).href;
        if (navigator.share) {
            try {
                await navigator.share({ title: `${titulo} — Samuel Mickael`, url });
            } catch {
                /* usuário cancelou o compartilhamento */
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                mostrarToast(`Link de "${titulo}" copiado!`);
            } catch {
                mostrarToast("Não foi possível copiar. Copie manualmente.");
            }
        }
    });
});

/* Copiar exemplo de request da API */
document.querySelectorAll("[data-copiar-codigo]").forEach((botao) => {
    botao.addEventListener("click", async () => {
        const codigo = botao.getAttribute("data-copiar-codigo");
        try {
            await navigator.clipboard.writeText(codigo);
            mostrarToast("Exemplo de request copiado!");
        } catch {
            mostrarToast("Não foi possível copiar. Copie manualmente.");
        }
    });
});

/* Aba reativa: chama atenção quando o visitante troca de aba */
const tituloOriginal = document.title;
document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "👀 Volte aqui! — Samuel Mickael" : tituloOriginal;
});

/* Tour guiado */
const botaoTour = document.getElementById("botaoTour");
const tourOverlay = document.getElementById("tourOverlay");
const tourRealce = document.getElementById("tourRealce");
const tourCaixa = document.getElementById("tourCaixa");
const tourPassoEl = document.getElementById("tourPasso");
const tourTituloEl = document.getElementById("tourTitulo");
const tourTextoEl = document.getElementById("tourTexto");
const tourAnterior = document.getElementById("tourAnterior");
const tourProximo = document.getElementById("tourProximo");
const tourPular = document.getElementById("tourPular");

const passosTour = [
    { seletor: "#sobre-mim .titulo-secao", titulo: "Quem sou", texto: "Um resumo rápido sobre mim, minha formação e minhas competências principais." },
    { seletor: "#projetos .titulo-secao", titulo: "Projetos em destaque", texto: "Os trabalhos que representam meu aprendizado — dá pra filtrar por tecnologia e testar as demos direto aqui." },
    { seletor: "#servicos .titulo-secao", titulo: "Como posso ajudar", texto: "Os tipos de projeto que eu topo desenvolver: sites, aplicações web e automações em Python." },
    { seletor: "#contato .contato-acoes", titulo: "Vamos conversar", texto: "Se tiver uma vaga, projeto ou só quiser trocar uma ideia, é por aqui." },
];
let passoAtualTour = 0;

function posicionarTour() {
    const passo = passosTour[passoAtualTour];
    const alvo = document.querySelector(passo.seletor);
    if (!alvo || !tourRealce || !tourCaixa) return;

    // Scroll instantâneo e cálculo síncrono, na mesma execução: elimina qualquer corrida entre a
    // animação do scroll e a leitura de getBoundingClientRect (scrollend/timeout se mostraram pouco
    // confiáveis para distâncias grandes). Importante: "instant" e não "auto" — o CSS global tem
    // scroll-behavior:smooth em html, e "auto" herda isso (continua animando). O visual continua
    // suave porque .tour-caixa e .tour-realce já têm transition de top/left no CSS.
    alvo.scrollIntoView({ behavior: "instant", block: "center" });

    const rect = alvo.getBoundingClientRect();
    const folga = 10;
    tourRealce.style.top = Math.max(rect.top - folga, 0) + "px";
    tourRealce.style.left = Math.max(rect.left - folga, 0) + "px";
    tourRealce.style.width = rect.width + folga * 2 + "px";
    tourRealce.style.height = rect.height + folga * 2 + "px";

    const espacoAbaixo = window.innerHeight - rect.bottom;
    const caixaAcimaDoAlvo = espacoAbaixo < 220;
    const topoCaixa = caixaAcimaDoAlvo ? Math.max(rect.top - 190, 12) : Math.min(rect.bottom + 12, window.innerHeight - 200);
    tourCaixa.style.top = Math.max(topoCaixa, 12) + "px";
    tourCaixa.style.left = Math.min(Math.max(rect.left, 16), window.innerWidth - 356) + "px";

    tourPassoEl.textContent = `Passo ${passoAtualTour + 1} de ${passosTour.length}`;
    tourTituloEl.textContent = passo.titulo;
    tourTextoEl.textContent = passo.texto;
    tourAnterior.disabled = passoAtualTour === 0;
    tourProximo.textContent = passoAtualTour === passosTour.length - 1 ? "Concluir" : "Próximo";
}

function abrirTour() {
    passoAtualTour = 0;
    tourOverlay.hidden = false;
    posicionarTour();
}

function fecharTour() {
    tourOverlay.hidden = true;
}

botaoTour?.addEventListener("click", abrirTour);
tourPular?.addEventListener("click", fecharTour);
tourAnterior?.addEventListener("click", () => {
    if (passoAtualTour > 0) {
        passoAtualTour--;
        posicionarTour();
    }
});
tourProximo?.addEventListener("click", () => {
    if (passoAtualTour < passosTour.length - 1) {
        passoAtualTour++;
        posicionarTour();
    } else {
        fecharTour();
    }
});
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && tourOverlay && !tourOverlay.hidden) fecharTour();
});

const suportaHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Parallax sutil no círculo do hero */
const heroConteudo = document.querySelector(".hero-conteudo");
if (heroConteudo && !prefereMenosMovimento) {
    window.addEventListener("scroll", () => {
        heroConteudo.style.setProperty("--parallax", Math.min(window.scrollY * 0.15, 160) + "px");
    });
}

/* Tilt 3D nos cards de projeto */
if (suportaHover && !prefereMenosMovimento) {
    document.body.classList.add("tem-tilt");
    cardsProjeto.forEach((card) => {
        card.addEventListener("mousemove", (evento) => {
            const rect = card.getBoundingClientRect();
            const centroX = rect.width / 2;
            const centroY = rect.height / 2;
            const x = evento.clientX - rect.left;
            const y = evento.clientY - rect.top;
            const rotY = ((x - centroX) / centroX) * 6;
            const rotX = ((centroY - y) / centroY) * 6;
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-7px)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}
